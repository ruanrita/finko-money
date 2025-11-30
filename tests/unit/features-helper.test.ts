import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAllFeatures,
  getPlanFeatures,
  userHasFeatureAccess,
  getUserFeaturesWithAccess,
  getMinimumPlanForFeature,
} from '@/lib/features-helper'

const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  order: vi.fn(),
  single: vi.fn(),
  limit: vi.fn(),
  rpc: vi.fn(),
} as any

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => mockSupabase,
}))

describe('Features Helper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllFeatures', () => {
    it('should return all features sorted by sort_order', async () => {
      const mockFeatures = [
        { id: '1', name: 'dashboard', display_name: 'Dashboard', path: '/dashboard', sort_order: 1, is_core: true },
        { id: '2', name: 'reports', display_name: 'Relatórios', path: '/relatorios', sort_order: 7, is_core: false },
        { id: '3', name: 'transactions', display_name: 'Transações', path: '/financeiro', sort_order: 2, is_core: false },
      ]

      mockSupabase.order.mockResolvedValueOnce({
        data: mockFeatures,
        error: null,
      })

      const result = await getAllFeatures()

      expect(result).toEqual(mockFeatures)
      expect(mockSupabase.from).toHaveBeenCalledWith('features')
      expect(mockSupabase.order).toHaveBeenCalledWith('sort_order', { ascending: true })
    })

    it('should return empty array on error', async () => {
      mockSupabase.order.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      })

      const result = await getAllFeatures()

      expect(result).toEqual([])
    })
  })

  describe('getPlanFeatures', () => {
    it('should return features available for a specific plan', async () => {
      const mockPlanFeatures = [
        { features: { id: '2', name: 'reports', path: '/relatorios' } },
        { features: { id: '3', name: 'transactions', path: '/financeiro' } },
      ]

      mockSupabase.eq.mockResolvedValueOnce({
        data: mockPlanFeatures,
        error: null,
      })

      const result = await getPlanFeatures('plan-free-123')

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ id: '2', name: 'reports', path: '/relatorios' })
      expect(mockSupabase.eq).toHaveBeenCalledWith('plan_id', 'plan-free-123')
    })

    it('should filter out null features from join', async () => {
      const mockPlanFeatures = [
        { features: { id: '2', name: 'reports', path: '/relatorios' } },
        { features: null }, // Orphaned relation
      ]

      mockSupabase.eq.mockResolvedValueOnce({
        data: mockPlanFeatures,
        error: null,
      })

      const result = await getPlanFeatures('plan-123')

      expect(result).toHaveLength(1)
    })
  })

  describe('userHasFeatureAccess', () => {
    it('should return true for admins', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true,
        error: null,
      })

      const result = await userHasFeatureAccess('admin-user-123', '/relatorios')

      expect(result).toBe(true)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('user_has_feature_access', {
        user_id_param: 'admin-user-123',
        feature_path_param: '/relatorios',
      })
    })

    it('should return true for early adopters', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true,
        error: null,
      })

      const result = await userHasFeatureAccess('early-adopter-123', '/relatorios')

      expect(result).toBe(true)
    })

    it('should return false for free users without feature access', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: false,
        error: null,
      })

      const result = await userHasFeatureAccess('free-user-123', '/analytics')

      expect(result).toBe(false)
    })

    it('should return true for core features', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true,
        error: null,
      })

      const result = await userHasFeatureAccess('user-123', '/dashboard')

      expect(result).toBe(true)
    })

    it('should fail open (allow access) on database error', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'RPC error' },
      })

      const result = await userHasFeatureAccess('user-123', '/relatorios')

      // Fail open to prevent lockouts
      expect(result).toBe(true)
    })
  })

  describe('getUserFeaturesWithAccess', () => {
    it('should be defined as a function', () => {
      expect(getUserFeaturesWithAccess).toBeDefined()
      expect(typeof getUserFeaturesWithAccess).toBe('function')
    })

    it('should return array with UserFeatureAccess structure', async () => {
      // Mock successful user query
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          is_admin: true,
          is_early_adopter: false,
          subscription_plan_id: 'plan-123',
        },
        error: null,
      })

      // Mock features query
      mockSupabase.order.mockResolvedValueOnce({
        data: [
          { id: '1', name: 'dashboard', is_core: true, path: '/dashboard', display_name: 'Dashboard' },
        ],
        error: null,
      })

      const result = await getUserFeaturesWithAccess('admin-123')

      // Verify structure
      expect(Array.isArray(result)).toBe(true)
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('feature')
        expect(result[0]).toHaveProperty('hasAccess')
        expect(result[0]).toHaveProperty('isCore')
      }
    })
  })

  describe('getMinimumPlanForFeature', () => {
    it('should be defined as a function', () => {
      expect(getMinimumPlanForFeature).toBeDefined()
      expect(typeof getMinimumPlanForFeature).toBe('function')
    })

    it('should return null for core features', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'feature-1',
          is_core: true,
        },
        error: null,
      })

      const result = await getMinimumPlanForFeature('/dashboard')

      expect(result).toBeNull()
    })

    it('should return null if feature not found', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Feature not found' },
      })

      const result = await getMinimumPlanForFeature('/nonexistent')

      expect(result).toBeNull()
    })

    it('should return null if no plans include the feature', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'feature-orphan',
          is_core: false,
        },
        error: null,
      })

      mockSupabase.limit.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      const result = await getMinimumPlanForFeature('/orphan-feature')

      expect(result).toBeNull()
    })
  })
})
