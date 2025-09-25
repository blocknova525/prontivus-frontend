import { useState, useMemo, useCallback } from 'react'

export interface SearchFilters {
  query: string
  category?: string
  status?: string
  dateFrom?: Date
  dateTo?: Date
  doctor?: string
  insurance?: string
  priority?: string
  type?: string
}

export interface SearchResult<T> {
  data: T[]
  total: number
  filtered: number
  hasResults: boolean
}

export function useSearch<T>(
  data: T[],
  searchFields: (keyof T)[],
  initialFilters: Partial<SearchFilters> = {}
) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    ...initialFilters
  })

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      query: '',
      ...initialFilters
    })
  }, [initialFilters])

  const resetFilters = useCallback(() => {
    setFilters({
      query: '',
      category: undefined,
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      doctor: undefined,
      insurance: undefined,
      priority: undefined,
      type: undefined
    })
  }, [])

  const filteredData = useMemo(() => {
    let result = [...data]

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase()
      result = result.filter(item => {
        return searchFields.some(field => {
          const value = item[field]
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query)
          }
          if (typeof value === 'number') {
            return value.toString().includes(query)
          }
          return false
        })
      })
    }

    // Category filter
    if (filters.category) {
      result = result.filter(item => {
        const categoryField = item['category' as keyof T]
        return categoryField === filters.category
      })
    }

    // Status filter
    if (filters.status) {
      result = result.filter(item => {
        const statusField = item['status' as keyof T]
        return statusField === filters.status
      })
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      result = result.filter(item => {
        const dateField = item['date' as keyof T] || item['createdAt' as keyof T] || item['updatedAt' as keyof T]
        if (!dateField) return false
        
        const itemDate = new Date(dateField as any)
        
        if (filters.dateFrom && itemDate < filters.dateFrom) return false
        if (filters.dateTo && itemDate > filters.dateTo) return false
        
        return true
      })
    }

    // Doctor filter
    if (filters.doctor) {
      result = result.filter(item => {
        const doctorField = item['doctor' as keyof T] || item['doctorName' as keyof T] || item['doctorId' as keyof T]
        if (typeof doctorField === 'string') {
          return doctorField.toLowerCase().includes(filters.doctor!.toLowerCase())
        }
        return doctorField === filters.doctor
      })
    }

    // Insurance filter
    if (filters.insurance) {
      result = result.filter(item => {
        const insuranceField = item['insurance' as keyof T] || item['convenio' as keyof T]
        return insuranceField === filters.insurance
      })
    }

    // Priority filter
    if (filters.priority) {
      result = result.filter(item => {
        const priorityField = item['priority' as keyof T]
        return priorityField === filters.priority
      })
    }

    // Type filter
    if (filters.type) {
      result = result.filter(item => {
        const typeField = item['type' as keyof T] || item['appointmentType' as keyof T]
        return typeField === filters.type
      })
    }

    return result
  }, [data, filters, searchFields])

  const searchResult: SearchResult<T> = useMemo(() => ({
    data: filteredData,
    total: data.length,
    filtered: filteredData.length,
    hasResults: filteredData.length > 0
  }), [filteredData, data.length])

  return {
    filters,
    updateFilter,
    clearFilters,
    resetFilters,
    searchResult
  }
}

// Specialized search hooks for different entities
export function usePatientSearch(patients: any[]) {
  return useSearch(patients, ['name', 'cpf', 'phone', 'email', 'insurance'])
}

export function useAppointmentSearch(appointments: any[]) {
  return useSearch(appointments, ['patientName', 'doctorName', 'appointmentType', 'notes', 'insurance'])
}

export function useInventorySearch(inventory: any[]) {
  return useSearch(inventory, ['name', 'category', 'supplier', 'unit'])
}

export function useTransactionSearch(transactions: any[]) {
  return useSearch(transactions, ['patientName', 'doctorName', 'service', 'description', 'invoice', 'method'])
}

// Advanced search utilities
export function useAdvancedSearch<T>(
  data: T[],
  searchConfig: {
    fields: (keyof T)[]
    filters: Record<string, (item: T, value: any) => boolean>
  }
) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery)
  }, [])

  const updateFilter = useCallback((filterKey: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
  }, [])

  const clearFilter = useCallback((filterKey: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[filterKey]
      return newFilters
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setActiveFilters({})
    setQuery('')
  }, [])

  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply text search
    if (query) {
      const searchQuery = query.toLowerCase()
      result = result.filter(item => {
        return searchConfig.fields.some(field => {
          const value = item[field]
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchQuery)
          }
          if (typeof value === 'number') {
            return value.toString().includes(searchQuery)
          }
          return false
        })
      })
    }

    // Apply custom filters
    Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
        const filterFunction = searchConfig.filters[filterKey]
        if (filterFunction) {
          result = result.filter(item => filterFunction(item, filterValue))
        }
      }
    })

    return result
  }, [data, query, activeFilters, searchConfig])

  return {
    query,
    activeFilters,
    updateQuery,
    updateFilter,
    clearFilter,
    clearAllFilters,
    filteredData,
    hasActiveFilters: Object.keys(activeFilters).length > 0 || query !== ''
  }
}

// Search suggestions
export function useSearchSuggestions<T>(
  data: T[],
  field: keyof T,
  maxSuggestions: number = 5
) {
  const [query, setQuery] = useState('')

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return []

    const uniqueValues = new Set<string>()
    
    data.forEach(item => {
      const value = item[field]
      if (typeof value === 'string' && value.toLowerCase().includes(query.toLowerCase())) {
        uniqueValues.add(value)
      }
    })

    return Array.from(uniqueValues).slice(0, maxSuggestions)
  }, [data, field, query, maxSuggestions])

  return {
    query,
    setQuery,
    suggestions,
    hasSuggestions: suggestions.length > 0
  }
}
