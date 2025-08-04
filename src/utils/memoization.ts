import { useMemo } from 'react'

// Memoization utilities for expensive calculations
export const memoizeLeadScoring = (leads: any[]) => {
  return useMemo(() => {
    return leads.map(lead => {
      // Expensive lead scoring calculation
      let score = 0
      
      // Geographic scoring
      if (lead.region === 'Metro Manila') score += 40
      else if (['Calabarzon', 'Central Luzon', 'Central Visayas'].includes(lead.region)) score += 25
      else score += 15
      
      // Relationship scoring
      const relationshipScores = { kasama: 40, malapit: 30, kilala: 20, baguhan: 10 }
      score += relationshipScores[lead.relationshipLevel as keyof typeof relationshipScores] || 10
      
      // Behavioral scoring
      if (lead.source === 'referral') score += 25
      else if (lead.source === 'website') score += 15
      else if (lead.source === 'social_media') score += 10
      
      // Engagement scoring
      if (lead.lastInteraction) {
        const daysSinceInteraction = Math.floor(
          (Date.now() - new Date(lead.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSinceInteraction <= 7) score += 20
        else if (daysSinceInteraction <= 30) score += 10
        else score += 5
      }
      
      return { ...lead, calculatedScore: Math.min(score, 100) }
    })
  }, [leads])
}

export const memoizeRegionalAnalytics = (companies: any[]) => {
  return useMemo(() => {
    const regionStats = companies.reduce((acc, company) => {
      const region = company.region || 'Unknown'
      if (!acc[region]) {
        acc[region] = {
          count: 0,
          totalRevenue: 0,
          avgEmployees: 0,
          companies: []
        }
      }
      
      acc[region].count += 1
      acc[region].totalRevenue += company.annualRevenue || 0
      acc[region].companies.push(company)
      
      return acc
    }, {} as Record<string, any>)
    
    // Calculate averages
    Object.keys(regionStats).forEach(region => {
      const stats = regionStats[region]
      stats.avgEmployees = stats.companies.reduce((sum: number, c: any) => sum + (c.employeeCount || 0), 0) / stats.count
      stats.avgRevenue = stats.totalRevenue / stats.count
    })
    
    return regionStats
  }, [companies])
}

export const memoizeDealsPipeline = (deals: any[]) => {
  return useMemo(() => {
    const stageStats = deals.reduce((acc, deal) => {
      const stage = deal.stage || 'unknown'
      if (!acc[stage]) {
        acc[stage] = {
          count: 0,
          totalValue: 0,
          deals: []
        }
      }
      
      acc[stage].count += 1
      acc[stage].totalValue += deal.value || 0
      acc[stage].deals.push(deal)
      
      return acc
    }, {} as Record<string, any>)
    
    // Calculate conversion rates and other metrics
    const totalDeals = deals.length
    Object.keys(stageStats).forEach(stage => {
      const stats = stageStats[stage]
      stats.percentage = totalDeals > 0 ? (stats.count / totalDeals) * 100 : 0
      stats.avgValue = stats.count > 0 ? stats.totalValue / stats.count : 0
    })
    
    return stageStats
  }, [deals])
}

// Generic memoization hook for any expensive calculation
export const useMemoizedCalculation = <T, R>(
  data: T[],
  calculateFn: (data: T[]) => R,
  dependencies: any[] = []
): R => {
  return useMemo(() => {
    return calculateFn(data)
  }, [data, ...dependencies])
}

// Cache for frequently accessed data
class DataCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttlMs: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }
  
  get(key: string) {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  clear() {
    this.cache.clear()
  }
  
  size() {
    return this.cache.size
  }
}

export const dataCache = new DataCache()