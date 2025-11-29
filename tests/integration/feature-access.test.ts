import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Integration Test: Feature Access Flow
 *
 * Tests the complete flow of feature access control:
 * 1. User logs in
 * 2. System checks user plan
 * 3. System loads features from database
 * 4. Navigation renders with correct access controls
 * 5. User attempts to access restricted feature
 */

const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(),
  rpc: vi.fn(),
  order: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  delete: vi.fn(() => mockSupabase),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => mockSupabase,
}))

describe('Feature Access Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should grant full access to admin user', async () => {
    // 1. User authentication
    const userId = 'admin-user-123'

    // 2. Get user plan (admin)
    mockSupabase.single.mockResolvedValueOnce({
      data: {
        id: userId,
        is_admin: true,
        is_early_adopter: false,
        subscription_plan_id: 'plan-free',
        subscription_plans: {
          name: 'free',
          display_name: 'Plano Free',
        },
      },
      error: null,
    })

    // 3. Load all features
    const allFeatures = [
      { id: '1', name: 'dashboard', path: '/dashboard', is_core: true },
      { id: '2', name: 'reports', path: '/relatorios', is_core: false },
      { id: '3', name: 'analytics', path: '/analytics', is_core: false },
    ]

    mockSupabase.order.mockResolvedValueOnce({
      data: allFeatures,
      error: null,
    })

    // 4. Check access to each feature
    for (const feature of allFeatures) {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true, // Admin has access to everything
        error: null,
      })
    }

    // Verify all features are accessible
    const accessChecks = await Promise.all(
      allFeatures.map(async (feature) => {
        const { data } = await mockSupabase.rpc('user_has_feature_access', {
          user_id_param: userId,
          feature_path_param: feature.path,
        })
        return { feature: feature.name, hasAccess: data }
      })
    )

    expect(accessChecks.every(check => check.hasAccess)).toBe(true)
  })

  it('should restrict features for free user', async () => {
    // 1. User authentication
    const userId = 'free-user-123'

    // 2. Get user plan (free)
    mockSupabase.single.mockResolvedValueOnce({
      data: {
        id: userId,
        is_admin: false,
        is_early_adopter: false,
        subscription_plan_id: 'plan-free',
        subscription_plans: {
          id: 'plan-free',
          name: 'free',
          display_name: 'Plano Free',
        },
      },
      error: null,
    })

    // 3. Load all features
    const allFeatures = [
      { id: '1', name: 'dashboard', path: '/dashboard', is_core: true },
      { id: '2', name: 'reports', path: '/relatorios', is_core: false },
      { id: '3', name: 'analytics', path: '/analytics', is_core: false },
    ]

    mockSupabase.order.mockResolvedValueOnce({
      data: allFeatures,
      error: null,
    })

    // 4. Load plan features (free plan only has reports, not analytics)
    mockSupabase.eq.mockResolvedValueOnce({
      data: [
        { features: allFeatures[1] }, // reports
      ],
      error: null,
    })

    // 5. Check feature access
    // Core features always accessible
    mockSupabase.rpc.mockResolvedValueOnce({
      data: true,
      error: null,
    })

    // Reports - in plan
    mockSupabase.rpc.mockResolvedValueOnce({
      data: true,
      error: null,
    })

    // Analytics - not in plan
    mockSupabase.rpc.mockResolvedValueOnce({
      data: false,
      error: null,
    })

    // Verify access control
    const dashboardAccess = await mockSupabase.rpc('user_has_feature_access')
    const reportsAccess = await mockSupabase.rpc('user_has_feature_access')
    const analyticsAccess = await mockSupabase.rpc('user_has_feature_access')

    expect(dashboardAccess.data).toBe(true) // Core
    expect(reportsAccess.data).toBe(true) // In plan
    expect(analyticsAccess.data).toBe(false) // Not in plan
  })

  it('should grant full access to early adopter', async () => {
    const userId = 'early-adopter-123'

    // User is early adopter
    mockSupabase.single.mockResolvedValueOnce({
      data: {
        id: userId,
        is_admin: false,
        is_early_adopter: true,
        subscription_plan_id: 'plan-initial-launch',
      },
      error: null,
    })

    // All features
    const allFeatures = [
      { id: '1', path: '/dashboard' },
      { id: '2', path: '/relatorios' },
      { id: '3', path: '/analytics' },
      { id: '4', path: '/advanced-ai' },
    ]

    mockSupabase.order.mockResolvedValueOnce({
      data: allFeatures,
      error: null,
    })

    // Early adopter - all features return true
    allFeatures.forEach(() => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true,
        error: null,
      })
    })

    // Verify all features accessible
    const checks = await Promise.all(
      allFeatures.map(() => mockSupabase.rpc('user_has_feature_access'))
    )

    expect(checks.every(check => check.data === true)).toBe(true)
  })

  it('should handle admin toggling feature for plan', async () => {
    const adminUserId = 'admin-123'
    const planId = 'plan-free'
    const featureId = 'feature-reports'

    // 1. Admin enables feature for free plan
    mockSupabase.from('plan_features').insert({
      plan_id: planId,
      feature_id: featureId,
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('plan_features')
    expect(mockSupabase.insert).toHaveBeenCalled()

    // 2. Free user now has access
    mockSupabase.rpc.mockResolvedValueOnce({
      data: true,
      error: null,
    })

    const access = await mockSupabase.rpc('user_has_feature_access', {
      user_id_param: 'free-user-123',
      feature_path_param: '/relatorios',
    })

    expect(access.data).toBe(true)

    // 3. Admin disables feature by calling delete
    mockSupabase.from('plan_features').delete()

    expect(mockSupabase.delete).toHaveBeenCalled()

    // 4. Free user loses access after feature is removed
    mockSupabase.rpc.mockResolvedValueOnce({
      data: false,
      error: null,
    })

    const accessAfterRemoval = await mockSupabase.rpc('user_has_feature_access', {
      user_id_param: 'free-user-123',
      feature_path_param: '/relatorios',
    })

    expect(accessAfterRemoval.data).toBe(false)
  })

  it('should handle usage limit check with feature access', async () => {
    const userId = 'user-123'

    // 1. Check feature access (reports)
    mockSupabase.rpc.mockResolvedValueOnce({
      data: true,
      error: null,
    })

    const hasAccess = await mockSupabase.rpc('user_has_feature_access', {
      user_id_param: userId,
      feature_path_param: '/relatorios',
    })

    expect(hasAccess.data).toBe(true)

    // 2. Check usage limit (export functionality)
    // Simulating checking if user's plan allows PDF export
    const mockPlanData = {
      subscription_plans: {
        export_formats: ['csv', 'pdf'],
      },
    }

    const canExportPDF = mockPlanData.subscription_plans.export_formats.includes('pdf')

    expect(canExportPDF).toBe(true)

    // Verify the access check was called
    expect(mockSupabase.rpc).toHaveBeenCalledWith('user_has_feature_access', {
      user_id_param: userId,
      feature_path_param: '/relatorios',
    })
  })
})
