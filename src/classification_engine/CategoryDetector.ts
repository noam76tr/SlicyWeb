/**
 * Wichy
 * Category Detector Definition
 *
 * Based on:
 * - OBJECT_CLASSIFICATION_SPEC.md
 * - AI_ENGINE_SPEC.md
 * - DATA_SCHEMA.md
 */

export class CategoryDetector {
  public detect(
    features: string[]
  ): string {
    const normalizedFeatures =
      features.map((feature) =>
        feature.toLowerCase()
      );

    if (
      this.hasAny(
        normalizedFeatures,
        [
          "teeth",
          "gear",
          "circular"
        ]
      )
    ) {
      return "gear";
    }

    if (
      this.hasAny(
        normalizedFeatures,
        [
          "bracket",
          "mounting_holes",
          "reinforcement_ribs"
        ]
      )
    ) {
      return "bracket";
    }

    if (
      this.hasAny(
        normalizedFeatures,
        [
          "figurine",
          "organic",
          "curves"
        ]
      )
    ) {
      return "figurine";
    }

    if (
      this.hasAny(
        normalizedFeatures,
        [
          "miniature",
          "small_features",
          "fine_details"
        ]
      )
    ) {
      return "miniature";
    }

    if (
      this.hasAny(
        normalizedFeatures,
        [
          "container",
          "internal_volume",
          "open_top"
        ]
      )
    ) {
      return "container";
    }

    if (
      this.hasAny(
        normalizedFeatures,
        [
          "vase",
          "thin_walls",
          "hollow"
        ]
      )
    ) {
      return "vase";
    }

    if (
      this.hasAny(
        normalizedFeatures,
        [
          "enclosure",
          "electronics",
          "cover"
        ]
      )
    ) {
      return "enclosure";
    }

    if (
      this.hasAny(
        normalizedFeatures,
        [
          "tool",
          "grip",
          "handle"
        ]
      )
    ) {
      return "tool";
    }

    if (
      this.hasAny(
        normalizedFeatures,
        [
          "articulated",
          "joint",
          "linked"
        ]
      )
    ) {
      return "articulated_model";
    }

    if (
      this.hasAny(
        normalizedFeatures,
        [
          "prototype",
          "concept"
        ]
      )
    ) {
      return "prototype";
    }

    if (
      this.hasAny(
        normalizedFeatures,
        [
          "structural",
          "load_bearing"
        ]
      )
    ) {
      return "structural_component";
    }

    if (
      this.hasAny(
        normalizedFeatures,
        [
          "mechanical",
          "functional_geometry",
          "holes"
        ]
      )
    ) {
      return "mechanical_part";
    }

    if (
      this.hasAny(
        normalizedFeatures,
        [
          "decorative",
          "aesthetic"
        ]
      )
    ) {
      return "decorative_object";
    }

    if (
      this.hasAny(
        normalizedFeatures,
        [
          "functional",
          "engineering"
        ]
      )
    ) {
      return "mechanical_part";
    }

    return "unknown";
  }

  private hasAny(
    features: string[],
    candidates: string[]
  ): boolean {
    return candidates.some(
      (candidate) =>
        features.includes(candidate)
    );
  }
}
