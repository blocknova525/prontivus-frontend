import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  User,
  Building2,
  DollarSign
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export interface SearchFilter {
  field: string
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between'
  value: string | number | Date | [Date, Date]
}

export interface AdvancedSearchProps {
  onSearch: (filters: SearchFilter[]) => void
  onClear: () => void
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'number' | 'date' | 'select'
    options?: Array<{ value: string; label: string }>
  }>
  placeholder?: string
}

export function AdvancedSearch({ onSearch, onClear, fields, placeholder = "Buscar..." }: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [newFilter, setNewFilter] = useState<Partial<SearchFilter>>({
    field: fields[0]?.key || '',
    operator: 'contains',
    value: ''
  })

  const handleQuickSearch = () => {
    if (searchTerm.trim()) {
      const quickFilter: SearchFilter = {
        field: 'name', // Default field for quick search
        operator: 'contains',
        value: searchTerm.trim()
      }
      onSearch([quickFilter])
    }
  }

  const handleAddFilter = () => {
    if (newFilter.field && newFilter.operator && newFilter.value) {
      const filter: SearchFilter = {
        field: newFilter.field,
        operator: newFilter.operator as any,
        value: newFilter.value
      }
      setFilters(prev => [...prev, filter])
      setNewFilter({
        field: fields[0]?.key || '',
        operator: 'contains',
        value: ''
      })
    }
  }

  const handleRemoveFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index))
  }

  const handleApplyFilters = () => {
    onSearch(filters)
    setShowAdvanced(false)
  }

  const handleClearAll = () => {
    setFilters([])
    setSearchTerm("")
    onClear()
  }

  const getFieldIcon = (fieldKey: string) => {
    switch (fieldKey) {
      case 'name':
      case 'patientName':
        return <User className="w-4 h-4" />
      case 'date':
      case 'createdAt':
        return <CalendarIcon className="w-4 h-4" />
      case 'value':
      case 'price':
        return <DollarSign className="w-4 h-4" />
      case 'clinic':
      case 'unit':
        return <Building2 className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  const getOperatorLabel = (operator: string) => {
    switch (operator) {
      case 'contains': return 'Contém'
      case 'equals': return 'Igual a'
      case 'startsWith': return 'Começa com'
      case 'endsWith': return 'Termina com'
      case 'greaterThan': return 'Maior que'
      case 'lessThan': return 'Menor que'
      case 'between': return 'Entre'
      default: return operator
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleQuickSearch()
              }
            }}
          />
        </div>
        <Button onClick={handleQuickSearch} className="medical-button-primary">
          <Search className="w-4 h-4 mr-2" />
          Buscar
        </Button>
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros Avançados
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filtros Avançados</h4>
                <Button variant="ghost" size="sm" onClick={handleClearAll}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Active Filters */}
              {filters.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Filtros Ativos:</Label>
                  <div className="flex flex-wrap gap-2">
                    {filters.map((filter, index) => (
                      <Badge key={index} className="flex items-center gap-1">
                        {getFieldIcon(filter.field)}
                        <span className="text-xs">
                          {fields.find(f => f.key === filter.field)?.label}: {getOperatorLabel(filter.operator)} {filter.value}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive/20"
                          onClick={() => handleRemoveFilter(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Adicionar Filtro:</Label>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="filter-field" className="text-xs">Campo</Label>
                    <Select value={newFilter.field} onValueChange={(value) => setNewFilter(prev => ({ ...prev, field: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar campo" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map((field) => (
                          <SelectItem key={field.key} value={field.key}>
                            <div className="flex items-center gap-2">
                              {getFieldIcon(field.key)}
                              {field.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="filter-operator" className="text-xs">Operador</Label>
                    <Select value={newFilter.operator} onValueChange={(value) => setNewFilter(prev => ({ ...prev, operator: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">Contém</SelectItem>
                        <SelectItem value="equals">Igual a</SelectItem>
                        <SelectItem value="startsWith">Começa com</SelectItem>
                        <SelectItem value="endsWith">Termina com</SelectItem>
                        <SelectItem value="greaterThan">Maior que</SelectItem>
                        <SelectItem value="lessThan">Menor que</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="filter-value" className="text-xs">Valor</Label>
                  {newFilter.field && fields.find(f => f.key === newFilter.field)?.type === 'select' ? (
                    <Select value={newFilter.value as string} onValueChange={(value) => setNewFilter(prev => ({ ...prev, value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar valor" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.find(f => f.key === newFilter.field)?.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Digite o valor"
                      value={newFilter.value as string}
                      onChange={(e) => setNewFilter(prev => ({ ...prev, value: e.target.value }))}
                    />
                  )}
                </div>

                <Button onClick={handleAddFilter} className="w-full" size="sm">
                  Adicionar Filtro
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button onClick={handleApplyFilters} className="flex-1 medical-button-primary" size="sm">
                  Aplicar Filtros
                </Button>
                <Button onClick={handleClearAll} variant="outline" size="sm">
                  Limpar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
