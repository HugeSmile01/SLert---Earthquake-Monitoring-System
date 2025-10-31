/**
 * Intensity Scale Service
 * Provides PHIVOLCS Earthquake Intensity Scale (PEIS) information and mappings
 */

export interface IntensityLevel {
  level: number;
  romanNumeral: string;
  description: string;
  effects: string;
  color: string;
  category: 'Scarcely Perceptible' | 'Slightly Felt' | 'Weak' | 'Moderately Strong' | 'Strong' | 'Very Strong' | 'Destructive' | 'Very Destructive' | 'Devastating' | 'Completely Devastating';
}

class IntensityScaleService {
  private intensityLevels: IntensityLevel[] = [
    {
      level: 1,
      romanNumeral: 'I',
      description: 'Scarcely Perceptible',
      effects: 'Perceptible to people under favorable circumstances. Delicately balanced objects are disturbed slightly. Still water in containers oscillates slowly.',
      color: '#10b981',
      category: 'Scarcely Perceptible'
    },
    {
      level: 2,
      romanNumeral: 'II',
      description: 'Slightly Felt',
      effects: 'Felt by few individuals at rest indoors. Hanging objects swing slightly. Still water in containers oscillates noticeably.',
      color: '#84cc16',
      category: 'Slightly Felt'
    },
    {
      level: 3,
      romanNumeral: 'III',
      description: 'Weak',
      effects: 'Felt by many people indoors especially in upper floors. Vibration is felt like one passing of a light truck. Hanging objects swing moderately. Still water in containers oscillates strongly.',
      color: '#eab308',
      category: 'Weak'
    },
    {
      level: 4,
      romanNumeral: 'IV',
      description: 'Moderately Strong',
      effects: 'Felt generally by people indoors and by some people outdoors. Light sleepers are awakened. Vibration is felt like a passing of heavy truck. Hanging objects swing considerably. Dining plates, glasses, windows and doors rattle.',
      color: '#f59e0b',
      category: 'Moderately Strong'
    },
    {
      level: 5,
      romanNumeral: 'V',
      description: 'Strong',
      effects: 'Generally felt by most people indoors and outdoors. Many sleeping people are awakened. Some are frightened. Strong shaking and rocking felt throughout the building. Hanging objects swing violently.',
      color: '#f97316',
      category: 'Strong'
    },
    {
      level: 6,
      romanNumeral: 'VI',
      description: 'Very Strong',
      effects: 'Many people are frightened. Some people lose their balance. Many run outdoors. Small church bells may ring. Wall plaster may crack. Heavy objects or furniture move or may be shifted.',
      color: '#ef4444',
      category: 'Very Strong'
    },
    {
      level: 7,
      romanNumeral: 'VII',
      description: 'Destructive',
      effects: 'Most people are frightened and run outdoors. People find it difficult to stand. Observed by persons driving cars. Hanging objects quiver. Furniture are broken. Weak concrete walls of well-built buildings are cracked.',
      color: '#dc2626',
      category: 'Destructive'
    },
    {
      level: 8,
      romanNumeral: 'VIII',
      description: 'Very Destructive',
      effects: 'People find it difficult to stand even outdoors. Many well-built buildings are considerably damaged. Concrete walls and old houses are badly damaged. Old or partly damaged structures collapse.',
      color: '#b91c1c',
      category: 'Very Destructive'
    },
    {
      level: 9,
      romanNumeral: 'IX',
      description: 'Devastating',
      effects: 'Many people panic. Most buildings are totally damaged. Bridges and elevated concrete structures are toppled or destroyed. Numerous landslides and liquefaction occur.',
      color: '#991b1b',
      category: 'Devastating'
    },
    {
      level: 10,
      romanNumeral: 'X',
      description: 'Completely Devastating',
      effects: 'Practically all structures are destroyed. Massive landslides occur. Ground fissures are observed. Objects are thrown into the air. Rivers are dammed and large bodies of water slosh over their banks.',
      color: '#7f1d1d',
      category: 'Completely Devastating'
    }
  ];

  /**
   * Estimate intensity from magnitude and depth (simplified formula)
   * 
   * This is a simplified approximation based on general seismological relationships.
   * The actual intensity at any location depends on many factors including:
   * - Distance from epicenter
   * - Local geology and soil conditions
   * - Building construction quality
   * - Focal mechanism and rupture directivity
   * 
   * Formula basis: Higher magnitude and shallower depth generally correlate with higher intensity.
   * Depth factor applies logarithmic attenuation (deeper earthquakes feel less intense at surface).
   * 
   * Note: For official intensity measurements, refer to PHIVOLCS intensity reports.
   */
  estimateIntensityFromMagnitude(magnitude: number, depthKm: number): IntensityLevel | null {
    if (magnitude < 2.0) return null;

    // Simplified intensity estimation based on magnitude and depth
    // Higher magnitude and shallower depth = higher intensity
    const depthFactor = Math.max(1, depthKm / 10); // Depth penalty
    const estimatedIntensity = Math.round(
      Math.min(10, Math.max(1, (magnitude - 1) * 1.5 - Math.log10(depthFactor)))
    );

    return this.getIntensityLevel(estimatedIntensity);
  }

  /**
   * Get intensity level by number
   */
  getIntensityLevel(level: number): IntensityLevel | null {
    if (level < 1 || level > 10) return null;
    return this.intensityLevels[level - 1];
  }

  /**
   * Get all intensity levels
   */
  getAllIntensityLevels(): IntensityLevel[] {
    return this.intensityLevels;
  }

  /**
   * Get intensity badge HTML
   */
  getIntensityBadge(magnitude: number, depthKm: number): string {
    const intensity = this.estimateIntensityFromMagnitude(magnitude, depthKm);
    if (!intensity) return '';

    return `
      <span class="px-2 py-1 rounded text-xs font-semibold" 
            style="background-color: ${intensity.color}; color: white;"
            title="${intensity.effects}">
        Intensity ${intensity.romanNumeral}
      </span>
    `;
  }

  /**
   * Get detailed intensity information card HTML
   */
  getIntensityCard(magnitude: number, depthKm: number): string {
    const intensity = this.estimateIntensityFromMagnitude(magnitude, depthKm);
    if (!intensity) {
      return '<p class="text-gray-500">Intensity estimation not available</p>';
    }

    return `
      <div class="border dark:border-gray-600 rounded-lg p-4" style="border-left: 4px solid ${intensity.color};">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-3xl font-bold" style="color: ${intensity.color};">
            ${intensity.romanNumeral}
          </span>
          <div>
            <h4 class="font-bold text-gray-800 dark:text-gray-200">${intensity.description}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">PHIVOLCS Intensity Scale</p>
          </div>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300">${intensity.effects}</p>
        <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
          <em>Note: This is an estimated intensity based on magnitude (M${magnitude.toFixed(1)}) and depth (${depthKm.toFixed(1)}km)</em>
        </p>
      </div>
    `;
  }
}

export const intensityScaleService = new IntensityScaleService();
