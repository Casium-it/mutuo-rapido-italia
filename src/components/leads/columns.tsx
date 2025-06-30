
import { ColumnDef } from "@tanstack/react-table"

// This is a basic columns definition for the leads table
// You can customize this based on your form_submissions table structure
export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "first_name",
    header: "Nome",
  },
  {
    accessorKey: "phone_number",
    header: "Telefono",
  },
  {
    accessorKey: "lead_status",
    header: "Stato",
  },
  {
    accessorKey: "created_at",
    header: "Data",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return date.toLocaleDateString()
    },
  },
]
