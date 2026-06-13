import SwiftUI
import WebKit

struct ContentView: View {
  // Change this to your domain once set up
  private let pageURL = URL(string: "https://gravitational-beam-emitter.github.io/banshan/")!

  var body: some View {
    WebView(url: pageURL, coordinator: BridgeCoordinator())
      .ignoresSafeArea()
  }
}

// MARK: - WKWebView wrapper

struct WebView: UIViewRepresentable {
  let url: URL
  let coordinator: BridgeCoordinator

  func makeCoordinator() -> BridgeCoordinator { coordinator }

  func makeUIView(context: Context) -> WKWebView {
    let config = WKWebViewConfiguration()
    let userContent = config.userContentController

    // Inject bridge object
    userContent.add(context.coordinator, name: "banshan")

    // JS that defines the bridge API
    let bridgeJS = """
    window.banshan = {
      fetchHealthData: function() {
        return new Promise(function(resolve) {
          window._banshanResolve = resolve;
          window.webkit.messageHandlers.banshan.postMessage('fetchAll');
        });
      }
    };
    """
    let script = WKUserScript(
      source: bridgeJS, injectionTime: .atDocumentStart, forMainFrameOnly: true)
    userContent.addUserScript(script)

    let wv = WKWebView(frame: .zero, configuration: config)
    wv.navigationDelegate = context.coordinator
    return wv
  }

  func updateUIView(_ webView: WKWebView, context: Context) {
    webView.load(URLRequest(url: url))
  }
}

// MARK: - JS Bridge

final class BridgeCoordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
  func userContentController(
    _ controller: WKUserContentController, didReceive msg: WKScriptMessage
  ) {
    guard msg.name == "banshan", let body = msg.body as? String, body == "fetchAll" else {
      return
    }
    Task {
      let json = await HealthKitManager.shared.fetchAll()
      await MainActor.run {
        msg.webView?.evaluateJavaScript(
          "window._banshanResolve(\(json))", completionHandler: nil)
      }
    }
  }

  func webView(
    _ webView: WKWebView,
    decidePolicyFor navAction: WKNavigationAction,
    decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
  ) {
    // Allow all navigation within the app
    decisionHandler(.allow)
  }
}
