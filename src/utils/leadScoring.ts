// Philippine Lead Scoring Algorithm
// Designed for Filipino business culture and market dynamics

interface LeadData {
  company?: string
  industry?: string
  region?: string
  position?: string
  source?: string
  emailDomain?: string
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  relationshipLevel?: 'baguhan' | 'kilala' | 'malapit' | 'kasama'
  dealValue?: number
  lastInteraction?: string
  responseTime?: number // in hours
  communicationPreference?: 'email' | 'phone' | 'sms' | 'face_to_face'
  decisionMakingStyle?: 'individual' | 'committee' | 'family_business'
  businessRegistration?: boolean
  hasWebsite?: boolean
  socialMediaPresence?: boolean
  previousPurchases?: number
  referralSource?: string
}

interface ScoringWeights {
  geographic: number
  demographic: number
  behavioral: number
  cultural: number
  firmographic: number
}

export class PhilippineLeadScoring {
  private weights: ScoringWeights = {
    geographic: 0.25,    // 25% - Location importance in PH
    demographic: 0.20,   // 20% - Company size, industry
    behavioral: 0.25,    // 25% - Engagement, response
    cultural: 0.20,      // 20% - Relationship, communication style
    firmographic: 0.10   // 10% - Company characteristics
  }

  calculateScore(lead: LeadData): {
    totalScore: number
    breakdown: Record<string, number>
    recommendations: string[]
  } {
    const geographic = this.calculateGeographicScore(lead)
    const demographic = this.calculateDemographicScore(lead)
    const behavioral = this.calculateBehavioralScore(lead)
    const cultural = this.calculateCulturalScore(lead)
    const firmographic = this.calculateFirmographicScore(lead)

    const breakdown = {
      geographic: Math.round(geographic * this.weights.geographic),
      demographic: Math.round(demographic * this.weights.demographic),
      behavioral: Math.round(behavioral * this.weights.behavioral),
      cultural: Math.round(cultural * this.weights.cultural),
      firmographic: Math.round(firmographic * this.weights.firmographic)
    }

    const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0)
    const recommendations = this.generateRecommendations(lead, breakdown)

    return {
      totalScore: Math.min(100, Math.max(0, totalScore)),
      breakdown,
      recommendations
    }
  }

  private calculateGeographicScore(lead: LeadData): number {
    let score = 0

    // Philippine regional scoring
    const regionScores: Record<string, number> = {
      'Metro Manila': 40,      // Highest economic activity
      'Calabarzon': 35,        // Industrial hub
      'Central Luzon': 30,     // Agricultural and industrial
      'Central Visayas': 25,   // Cebu business center
      'Western Visayas': 20,   // Iloilo growing market
      'Northern Mindanao': 20, // Cagayan de Oro
      'Davao Region': 25,      // Davao business hub
      'BARMM': 10,            // Emerging market
      'CAR': 15               // Tourism and agriculture
    }

    score += regionScores[lead.region || ''] || 10

    // City-specific bonuses
    const cityBonuses: Record<string, number> = {
      'Makati': 15,
      'BGC': 15,
      'Ortigas': 12,
      'Cebu City': 10,
      'Davao City': 8,
      'Iloilo City': 6
    }

    // Extract city from company info (simplified)
    const companyLower = (lead.company || '').toLowerCase()
    Object.entries(cityBonuses).forEach(([city, bonus]) => {
      if (companyLower.includes(city.toLowerCase())) {
        score += bonus
      }
    })

    return Math.min(100, score)
  }

  private calculateDemographicScore(lead: LeadData): number {
    let score = 0

    // Company size scoring
    const sizeScores: Record<string, number> = {
      'enterprise': 40,
      'large': 35,
      'medium': 25,
      'small': 15,
      'startup': 10
    }
    score += sizeScores[lead.companySize || ''] || 0

    // Industry scoring for Philippine market
    const industryScores: Record<string, number> = {
      'Real Estate': 35,
      'Banking': 40,
      'Technology': 30,
      'Retail': 25,
      'Manufacturing': 30,
      'Telecommunications': 35,
      'Healthcare': 25,
      'Education': 20,
      'Tourism': 15,
      'Agriculture': 10,
      'Mining': 20
    }

    const industry = lead.industry || ''
    Object.entries(industryScores).forEach(([ind, points]) => {
      if (industry.toLowerCase().includes(ind.toLowerCase())) {
        score += points
      }
    })

    // Position/Title scoring
    const positionScore = this.getPositionScore(lead.position || '')
    score += positionScore

    return Math.min(100, score)
  }

  private calculateBehavioralScore(lead: LeadData): number {
    let score = 0

    // Lead source scoring
    const sourceScores: Record<string, number> = {
      'referral': 40,
      'existing_client': 35,
      'website': 25,
      'trade_show': 30,
      'linkedin': 20,
      'cold_outreach': 10,
      'social_media': 15
    }
    score += sourceScores[lead.source || ''] || 0

    // Response time scoring (Filipino business context)
    if (lead.responseTime !== undefined) {
      if (lead.responseTime <= 2) score += 25      // Very responsive
      else if (lead.responseTime <= 24) score += 20  // Same day
      else if (lead.responseTime <= 48) score += 15  // Within 2 days
      else if (lead.responseTime <= 168) score += 10 // Within a week
      else score += 5                                 // Slow response
    }

    // Previous purchases
    if (lead.previousPurchases && lead.previousPurchases > 0) {
      score += Math.min(20, lead.previousPurchases * 5)
    }

    // Deal value potential
    if (lead.dealValue) {
      if (lead.dealValue >= 5000000) score += 25      // ₱5M+
      else if (lead.dealValue >= 1000000) score += 20 // ₱1M+
      else if (lead.dealValue >= 500000) score += 15  // ₱500K+
      else if (lead.dealValue >= 100000) score += 10  // ₱100K+
      else score += 5
    }

    return Math.min(100, score)
  }

  private calculateCulturalScore(lead: LeadData): number {
    let score = 0

    // Relationship level (core Filipino business value)
    const relationshipScores: Record<string, number> = {
      'kasama': 40,    // Inner circle - highest trust
      'malapit': 30,   // Close relationship
      'kilala': 20,    // Known contact
      'baguhan': 10    // New contact
    }
    score += relationshipScores[lead.relationshipLevel || ''] || 0

    // Communication preference scoring
    const commPreferenceScores: Record<string, number> = {
      'face_to_face': 25,  // Preferred in PH culture
      'phone': 20,         // Personal touch
      'sms': 15,           // Popular in PH
      'email': 10          // Less personal
    }
    score += commPreferenceScores[lead.communicationPreference || ''] || 0

    // Decision making style
    const decisionStyleScores: Record<string, number> = {
      'individual': 25,      // Quick decisions
      'committee': 15,       // Common in large corps
      'family_business': 20  // Personal relationships matter
    }
    score += decisionStyleScores[lead.decisionMakingStyle || ''] || 0

    // Referral bonus (very important in PH culture)
    if (lead.referralSource && lead.source === 'referral') {
      score += 15
    }

    return Math.min(100, score)
  }

  private calculateFirmographicScore(lead: LeadData): number {
    let score = 0

    // Business registration
    if (lead.businessRegistration) score += 20

    // Digital presence
    if (lead.hasWebsite) score += 15
    if (lead.socialMediaPresence) score += 10

    // Email domain quality
    if (lead.emailDomain) {
      const domain = lead.emailDomain.toLowerCase()
      if (domain.includes('.com.ph') || domain.includes('.ph')) {
        score += 15 // Philippine domain
      } else if (!['gmail.com', 'yahoo.com', 'hotmail.com'].includes(domain)) {
        score += 10 // Professional domain
      }
    }

    return Math.min(100, score)
  }

  private getPositionScore(position: string): number {
    const pos = position.toLowerCase()
    
    // C-level executives
    if (pos.includes('ceo') || pos.includes('president') || pos.includes('chairman')) return 35
    if (pos.includes('cto') || pos.includes('cfo') || pos.includes('coo')) return 30
    
    // VPs and Directors
    if (pos.includes('vice president') || pos.includes('vp')) return 25
    if (pos.includes('director')) return 20
    
    // Managers
    if (pos.includes('manager') || pos.includes('head')) return 15
    
    // Other positions
    if (pos.includes('owner') || pos.includes('founder')) return 30
    if (pos.includes('assistant') || pos.includes('coordinator')) return 5
    
    return 10 // Default
  }

  private generateRecommendations(lead: LeadData, breakdown: Record<string, number>): string[] {
    const recommendations: string[] = []

    // Geographic recommendations
    if (breakdown.geographic < 15) {
      recommendations.push('Consider regional partnerships or local representation for better market penetration')
    }

    // Cultural recommendations
    if (breakdown.cultural < 15) {
      if (lead.relationshipLevel === 'baguhan') {
        recommendations.push('Focus on relationship building through face-to-face meetings and cultural activities')
      }
      recommendations.push('Emphasize personal connections and trust-building in communications')
    }

    // Behavioral recommendations
    if (breakdown.behavioral < 15) {
      recommendations.push('Improve engagement through follow-up calls and personalized communication')
      if (!lead.responseTime || lead.responseTime > 48) {
        recommendations.push('Implement faster response protocols - Filipino businesses value quick responses')
      }
    }

    // Demographic recommendations
    if (breakdown.demographic < 15) {
      recommendations.push('Qualify decision-making authority and budget capacity')
      recommendations.push('Research company hierarchy and involve appropriate stakeholders')
    }

    // Industry-specific recommendations
    if (lead.industry) {
      const industry = lead.industry.toLowerCase()
      if (industry.includes('family') || lead.decisionMakingStyle === 'family_business') {
        recommendations.push('Involve family members in decision process and emphasize long-term partnership benefits')
      }
      if (industry.includes('government') || industry.includes('public')) {
        recommendations.push('Prepare for longer sales cycles and compliance documentation')
      }
    }

    return recommendations
  }

  // Update scoring weights based on business needs
  updateWeights(newWeights: Partial<ScoringWeights>): void {
    this.weights = { ...this.weights, ...newWeights }
  }

  // Get scoring distribution for analytics
  getScoreDistribution(leads: LeadData[]): {
    high: number    // 80-100
    medium: number  // 50-79
    low: number     // 0-49
  } {
    const scores = leads.map(lead => this.calculateScore(lead).totalScore)
    
    return {
      high: scores.filter(score => score >= 80).length,
      medium: scores.filter(score => score >= 50 && score < 80).length,
      low: scores.filter(score => score < 50).length
    }
  }
}

// Export singleton instance
export const leadScorer = new PhilippineLeadScoring()