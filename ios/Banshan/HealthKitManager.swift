import HealthKit

final class HealthKitManager: @unchecked Sendable {
  static let shared = HealthKitManager()
  private let store = HKHealthStore()

  func requestAuth() async throws {
    let readTypes: Set<HKObjectType> = [
      HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!,
      HKObjectType.quantityType(forIdentifier: .heartRate)!,
      HKObjectType.quantityType(forIdentifier: .stepCount)!,
      HKObjectType.quantityType(forIdentifier: .bodyMass)!,
    ]
    try await store.requestAuthorization(toShare: [], read: readTypes)
  }

  /// Fetch all available health data and return as JSON string
  func fetchAll() async -> String {
    var result: [String: Any] = [:]

    // Sleep
    if let sleep = await fetchCategory(.sleepAnalysis, unit: .hour()) {
      result["sleep"] = sleep
    }

    // Heart Rate
    if let hr = await fetchQuantity(.heartRate, unit: HKUnit(from: "count/min")) {
      result["heartRate"] = hr
    }

    // Steps (today)
    if let steps = await fetchQuantityToday(.stepCount, unit: .count()) {
      result["steps"] = steps
    }

    // Weight
    if let weight = await fetchMostRecent(.bodyMass, unit: HKUnit.gramUnit(with: .kilo)) {
      result["weight"] = weight
    }

    guard let json = try? JSONSerialization.data(withJSONObject: result),
          let str = String(data: json, encoding: .utf8) else {
      return "{}"
    }
    return str
  }

  // MARK: - Private fetch helpers

  private func fetchCategory(
    _ id: HKCategoryTypeIdentifier, unit: HKUnit
  ) async -> [String: Any]? {
    let type = HKObjectType.categoryType(forIdentifier: id)!
    let now = Date()
    let weekAgo = Calendar.current.date(byAdding: .day, value: -7, to: now)!
    let pred = HKQuery.predicateForSamples(withStart: weekAgo, end: now)

    return await withCheckedContinuation { cont in
      let query = HKSampleQuery(
        sampleType: type, predicate: pred, limit: 100,
        sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)]
      ) { _, samples, _ in
        guard let samples = samples as? [HKCategorySample], !samples.isEmpty else {
          cont.resume(returning: nil)
          return
        }
        let total = samples.reduce(0.0) { acc, s in
          acc + s.endDate.timeIntervalSince(s.startDate)
        }
        let hours = (total / 3600 * 10).rounded() / 10
        let nights = samples.filter { $0.value == HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue }.count
        cont.resume(returning: ["avgHoursPerNight": hours / max(Double(nights), 1), "totalNights": nights])
      }
      store.execute(query)
    }
  }

  private func fetchQuantity(
    _ id: HKQuantityTypeIdentifier, unit: HKUnit
  ) async -> [String: Double]? {
    let type = HKObjectType.quantityType(forIdentifier: id)!
    let now = Date()
    let weekAgo = Calendar.current.date(byAdding: .day, value: -7, to: now)!
    let pred = HKQuery.predicateForSamples(withStart: weekAgo, end: now)

    return await withCheckedContinuation { cont in
      let query = HKSampleQuery(
        sampleType: type, predicate: pred, limit: 500,
        sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: true)]
      ) { _, samples, _ in
        guard let samples = samples as? [HKQuantitySample], !samples.isEmpty else {
          cont.resume(returning: nil)
          return
        }
        let values = samples.map { $0.quantity.doubleValue(for: unit) }
        cont.resume(returning: ["avg": values.reduce(0, +) / Double(values.count), "min": values.min() ?? 0, "max": values.max() ?? 0])
      }
      store.execute(query)
    }
  }

  private func fetchQuantityToday(
    _ id: HKQuantityTypeIdentifier, unit: HKUnit
  ) async -> Double? {
    let type = HKObjectType.quantityType(forIdentifier: id)!
    let now = Date()
    let start = Calendar.current.startOfDay(for: now)
    let pred = HKQuery.predicateForSamples(withStart: start, end: now)

    return await withCheckedContinuation { cont in
      let query = HKStatisticsQuery(
        quantityType: type, quantitySamplePredicate: pred,
        options: .cumulativeSum
      ) { _, stats, _ in
        guard let sum = stats?.sumQuantity() else {
          cont.resume(returning: nil)
          return
        }
        cont.resume(returning: sum.doubleValue(for: unit))
      }
      store.execute(query)
    }
  }

  private func fetchMostRecent(
    _ id: HKQuantityTypeIdentifier, unit: HKUnit
  ) async -> Double? {
    let type = HKObjectType.quantityType(forIdentifier: id)!
    let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)

    return await withCheckedContinuation { cont in
      let query = HKSampleQuery(
        sampleType: type, predicate: nil, limit: 1, sortDescriptors: [sort]
      ) { _, samples, _ in
        guard let sample = samples?.first as? HKQuantitySample else {
          cont.resume(returning: nil)
          return
        }
        cont.resume(returning: sample.quantity.doubleValue(for: unit))
      }
      store.execute(query)
    }
  }
}
