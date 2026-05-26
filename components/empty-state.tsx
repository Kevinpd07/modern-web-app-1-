"use client"

import { motion } from "framer-motion"
import { FolderOpen } from "lucide-react"

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        animate={{ 
          y: [0, -8, 0],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-6"
      >
        <FolderOpen className="w-10 h-10 text-muted-foreground" />
      </motion.div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Sin herramientas aún
      </h3>
      
      <p className="text-muted-foreground max-w-xs text-pretty">
        Agrega tu primera herramienta tocando el botón + para comenzar
      </p>
    </motion.div>
  )
}
