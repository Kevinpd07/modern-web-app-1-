"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Tool {
  id: string
  name: string
  url: string
}

interface EditToolModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (id: string, name: string, url: string) => void
  tool: Tool | null
}

export function EditToolModal({ isOpen, onClose, onEdit, tool }: EditToolModalProps) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")

  useEffect(() => {
    if (tool) {
      setName(tool.name)
      setUrl(tool.url)
    }
  }, [tool])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tool && name.trim() && url.trim()) {
      let formattedUrl = url.trim()
      if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
        formattedUrl = "https://" + formattedUrl
      }
      onEdit(tool.id, name.trim(), formattedUrl)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md"
          >
            <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Editar Herramienta
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nombre
                  </label>
                  <Input
                    type="text"
                    placeholder="ej: GitHub"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary border-border focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    URL
                  </label>
                  <Input
                    type="text"
                    placeholder="ej: github.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-secondary border-border focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}