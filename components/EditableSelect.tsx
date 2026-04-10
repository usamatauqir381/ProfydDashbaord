// components/EditableSelect.tsx
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase/client"
import { Plus } from "lucide-react"

interface EditableSelectProps {
  category: string   // 'country', 'state', 'grade', 'sales_person', 'telecaller'
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function EditableSelect({ category, value, onChange, placeholder }: EditableSelectProps) {
  const [options, setOptions] = useState<string[]>([])
  const [newOption, setNewOption] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchOptions = async () => {
    const { data } = await supabase
      .from("dropdown_options")
      .select("value")
      .eq("category", category)
      .order("value")
    setOptions(data?.map(d => d.value) || [])
  }

  useEffect(() => {
    fetchOptions()
  }, [category])

  const addNewOption = async () => {
    if (!newOption.trim()) return
    const { error } = await supabase
      .from("dropdown_options")
      .insert({ category, value: newOption.trim() })
    if (!error) {
      fetchOptions()
      setNewOption("")
      setDialogOpen(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" type="button">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {category}</DialogTitle>
          </DialogHeader>
          <Input
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder={`Enter new ${category}`}
          />
          <Button onClick={addNewOption}>Save</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}