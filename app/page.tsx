"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ToolCard } from "@/components/tool-card"
import { AddToolModal } from "@/components/add-tool-modal"
import { EditToolModal } from "@/components/edit-tool-modal"
import { EmptyState } from "@/components/empty-state"
import { Input } from "@/components/ui/input"

interface Tool {
  id: string
  name: string
  url: string
  category?: string
}

export default function HomePage() {
  const router = useRouter()
  const [tools, setTools] = useState<Tool[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTools = useCallback(async () => {
    try {
      const response = await fetch("/api/tools")
      if (!response.ok) throw new Error("Failed to fetch tools")
      const data = await response.json()
      setTools(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching tools:", err)
      setError("Error al cargar las herramientas")
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session")
        const data = await response.json()
        if (!data.authenticated) {
          router.push("/login")
        } else {
          await fetchTools()
        }
      } catch {
        router.push("/login")
      }
    }
    checkAuth()
  }, [router, fetchTools])

  const addTool = async (name: string, url: string) => {
    const newTool: Tool = {
      id: Date.now().toString(),
      name,
      url,
      category: "General"
    }

    setTools(prev => [newTool, ...prev])

    try {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTool)
      })

      if (!response.ok) {
        throw new Error("Failed to add tool")
      }
    } catch (err) {
      console.error("Error adding tool:", err)
      setTools(prev => prev.filter(t => t.id !== newTool.id))
      setError("Error al agregar la herramienta")
    }
  }

  const deleteTool = async (id: string) => {
    const toolToDelete = tools.find(t => t.id === id)
    
    setTools(prev => prev.filter(tool => tool.id !== id))

    try {
      const response = await fetch(`/api/tools/${id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Failed to delete tool")
      }
    } catch (err) {
      console.error("Error deleting tool:", err)
      if (toolToDelete) {
        setTools(prev => [toolToDelete, ...prev])
      }
      setError("Error al eliminar la herramienta")
    }
  }

  const editTool = async (id: string, name: string, url: string) => {
    const originalTool = tools.find(t => t.id === id)
    const updatedTool = { ...originalTool!, name, url }
    
    setTools(prev => prev.map(tool => tool.id === id ? updatedTool : tool))

    try {
      const response = await fetch(`/api/tools/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url })
      })

      if (!response.ok) {
        throw new Error("Failed to edit tool")
      }
    } catch (err) {
      console.error("Error editing tool:", err)
      if (originalTool) {
        setTools(prev => prev.map(tool => tool.id === id ? originalTool : tool))
      }
      setError("Error al editar la herramienta")
    }
  }

  const openEditModal = (id: string) => {
    const tool = tools.find(t => t.id === id)
    if (tool) {
      setEditingTool(tool)
      setIsEditModalOpen(true)
    }
  }

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <main className="min-h-screen pb-24">
      <Header />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 max-w-3xl mx-auto mb-4"
        >
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
      
      {tools.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="px-4 max-w-3xl mx-auto mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar herramientas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </motion.div>
      )}

      <div className="px-4 max-w-3xl mx-auto">
        {filteredTools.length === 0 && tools.length === 0 ? (
          <EmptyState />
        ) : filteredTools.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">
              No se encontraron herramientas para "{searchQuery}"
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredTools.map((tool, index) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  index={index}
                  onDelete={deleteTool}
                  onEdit={openEditModal}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center shadow-lg shadow-primary/25 z-30"
      >
        <Plus className="w-7 h-7 text-primary-foreground" />
      </motion.button>

      <AddToolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addTool}
      />
      
      <EditToolModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingTool(null)
        }}
        onEdit={editTool}
        tool={editingTool}
      />
    </main>
  )
}