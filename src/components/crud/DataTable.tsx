import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdvancedSearch } from "@/components/ui/advanced-search"
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Upload,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title: string
  searchFields?: (keyof T)[]
  onAdd?: () => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  onExport?: () => void
  onImport?: () => void
  loading?: boolean
  emptyMessage?: string
  actions?: React.ReactNode
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  title,
  searchFields = [],
  onAdd,
  onEdit,
  onDelete,
  onView,
  onExport,
  onImport,
  loading = false,
  emptyMessage = "Nenhum item encontrado",
  actions
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Filter data based on search term
  const filteredData = data.filter(item => {
    if (!searchTerm) return true
    
    return searchFields.some(field => {
      const value = item[field]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase())
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchTerm)
      }
      return false
    })
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0
    
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const renderCell = (column: Column<T>, row: T) => {
    const value = row[column.key]
    
    if (column.render) {
      return column.render(value, row)
    }
    
    if (typeof value === 'boolean') {
      return (
        <Badge className={value ? "medical-status-active" : "medical-status-inactive"}>
          {value ? 'Sim' : 'Não'}
        </Badge>
      )
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString('pt-BR')
    }
    
    return value?.toString() || '-'
  }

  return (
    <Card className="medical-card">
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <CardTitle className="text-lg font-semibold text-foreground">
            {title}
          </CardTitle>
          
          <div className="flex gap-2">
            {onImport && (
              <Button variant="outline" size="sm" onClick={onImport}>
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
            {onAdd && (
              <Button className="medical-button-primary" size="sm" onClick={onAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            )}
            {actions}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Search and Filters */}
        <div className="p-6 border-b border-border">
          <AdvancedSearch
            onSearch={(filters) => {
              console.log("Aplicando filtros:", filters)
              // Implementar filtros avançados
            }}
            onClear={() => {
              setSearchTerm("")
              console.log("Limpando filtros")
            }}
            fields={columns.map(col => ({
              key: String(col.key),
              label: col.label,
              type: 'text' as const
            }))}
            placeholder={`Buscar em ${title.toLowerCase()}...`}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      "px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider",
                      column.sortable && "cursor-pointer hover:bg-muted/70",
                      column.width
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortField === column.key && (
                        <span className="text-primary">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2 text-muted-foreground">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                    <div className="text-muted-foreground">
                      <p className="text-lg mb-2">{emptyMessage}</p>
                      {onAdd && (
                        <Button className="medical-button-primary" onClick={onAdd}>
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Primeiro Item
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    {columns.map((column) => (
                      <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm">
                        {renderCell(column, row)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        {onView && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onView(row)}
                            className="text-primary hover:bg-primary/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(row)}
                            className="text-primary hover:bg-primary/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(row)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedData.length)} de {sortedData.length} itens
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={currentPage === page ? "medical-button-primary" : ""}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
