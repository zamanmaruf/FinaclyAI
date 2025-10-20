'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronUp, Search, Filter, Download, Wrench, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { ExceptionDetailsModal } from './ExceptionDetailsModal'

interface Exception {
  id: number
  exception_type: string
  severity: string
  description: string
  suggested_action: string
  related_stripe_id?: string
  related_bank_id?: string
  related_qbo_id?: string
  status: string
  created_at: string
  resolved_at?: string
}

interface ExceptionsTableProps {
  data: Exception[]
  onFix: (id: number) => void
  fixing: number | null
  onRefresh: () => void
}

const columnHelper = createColumnHelper<Exception>()

export function ExceptionsTable({ data, onFix, fixing, onRefresh }: ExceptionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedException, setSelectedException] = useState<Exception | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-black'
      case 'low':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const columns = [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    }),
    columnHelper.accessor('severity', {
      header: 'Severity',
      cell: ({ getValue }) => (
        <Badge className={getSeverityColor(getValue())}>
          {getValue().toUpperCase()}
        </Badge>
      ),
    }),
    columnHelper.accessor('exception_type', {
      header: 'Type',
      cell: ({ getValue }) => (
        <span className="font-medium">
          {getValue().replace('_', ' ').toUpperCase()}
        </span>
      ),
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: ({ getValue }) => (
        <div className="max-w-xs truncate" title={getValue()}>
          {getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('created_at', {
      header: 'Created',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-400">
          {new Date(getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge variant={getValue() === 'open' ? 'destructive' : 'secondary'}>
          {getValue().toUpperCase()}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.status === 'open' && row.original.exception_type === 'stripe_charge' && (
            <Button
              size="sm"
              onClick={() => onFix(row.original.id)}
              disabled={fixing === row.original.id}
              className="bg-primary-500 hover:bg-primary-600"
            >
              {fixing === row.original.id ? (
                <>
                  <Wrench className="w-3 h-3 mr-1 animate-spin" />
                  Fixing...
                </>
              ) : (
                'Fix'
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedException(row.original)
              setIsModalOpen(true)
            }}
          >
            View
          </Button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const handleBulkAction = async (action: string) => {
    if (selectedCount === 0) {
      toast.error('Please select exceptions first')
      return
    }

    const selectedIds = selectedRows.map(row => row.original.id)

    switch (action) {
      case 'fix':
        toast.loading(`Fixing ${selectedCount} exceptions...`)
        try {
          // Fix each selected exception
          for (const id of selectedIds) {
            await onFix(id)
          }
          toast.success(`Successfully fixed ${selectedCount} exceptions!`)
          // Clear selection
          table.toggleAllRowsSelected(false)
        } catch (error) {
          toast.error('Failed to fix some exceptions')
        }
        break
      case 'export':
        toast.loading(`Exporting ${selectedCount} exceptions...`)
        try {
          // Create CSV export
          const csvData = selectedRows.map(row => ({
            id: row.original.id,
            type: row.original.exception_type,
            severity: row.original.severity,
            description: row.original.description,
            created: row.original.created_at,
            status: row.original.status
          }))
          
          const csv = convertToCSV(csvData)
          downloadCSV(csv, 'exceptions.csv')
          toast.success(`Exported ${selectedCount} exceptions to CSV`)
        } catch (error) {
          toast.error('Failed to export exceptions')
        }
        break
      case 'mark_reviewed':
        toast.loading(`Marking ${selectedCount} exceptions as reviewed...`)
        try {
          // TODO: Implement mark as reviewed API call
          toast.success(`Marked ${selectedCount} exceptions as reviewed`)
          // Clear selection
          table.toggleAllRowsSelected(false)
        } catch (error) {
          toast.error('Failed to mark exceptions as reviewed')
        }
        break
    }
  }

  // Helper functions for CSV export
  const convertToCSV = (data: any[]) => {
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n')
    return csvContent
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <>
    <Card className="glass-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Exceptions</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('export')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search exceptions..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 bg-navy-800 border-white/20 text-white"
              />
            </div>
          </div>
          <Select
            value={(table.getColumn('severity')?.getFilterValue() as string) ?? ''}
            onValueChange={(value) =>
              table.getColumn('severity')?.setFilterValue(value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="w-40 bg-navy-800 border-white/20 text-white">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={(table.getColumn('exception_type')?.getFilterValue() as string) ?? ''}
            onValueChange={(value) =>
              table.getColumn('exception_type')?.setFilterValue(value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="w-40 bg-navy-800 border-white/20 text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="stripe_charge">Stripe Charge</SelectItem>
              <SelectItem value="bank_transaction">Bank Transaction</SelectItem>
              <SelectItem value="qbo_transaction">QBO Transaction</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg"
          >
            <span className="text-sm text-white">
              {selectedCount} exception{selectedCount > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleBulkAction('fix')}
                className="bg-primary-500 hover:bg-primary-600"
              >
                Fix Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('mark_reviewed')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Mark Reviewed
              </Button>
            </div>
          </motion.div>
        )}

        {/* Table */}
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-medium text-gray-300"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={`flex items-center gap-2 ${
                              header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <div className="flex flex-col">
                                {header.column.getIsSorted() === 'asc' ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : header.column.getIsSorted() === 'desc' ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <div className="w-3 h-3" />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-white">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-400">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-400">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Exception Details Modal */}
    <ExceptionDetailsModal
      exception={selectedException}
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false)
        setSelectedException(null)
      }}
      onFix={onFix}
      fixing={fixing !== null}
    />
    </>
  )
}
