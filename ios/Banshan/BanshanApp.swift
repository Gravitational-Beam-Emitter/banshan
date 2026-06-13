import SwiftUI
import HealthKit

@main
struct BanshanApp: App {
  @State private var store = HKHealthStore()

  var body: some Scene {
    WindowGroup {
      ContentView()
        .onAppear { requestHealthKit() }
    }
  }

  private func requestHealthKit() {
    let readTypes: Set<HKObjectType> = [
      HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!,
      HKObjectType.quantityType(forIdentifier: .heartRate)!,
      HKObjectType.quantityType(forIdentifier: .stepCount)!,
      HKObjectType.quantityType(forIdentifier: .bodyMass)!,
    ]

    store.requestAuthorization(toShare: [], read: readTypes) { ok, err in
      if let err = err { print("HealthKit auth error: \(err)") }
    }
  }
}
