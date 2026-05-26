"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Trash2, Edit, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tool {
  id: string;
  name: string;
  url: string;
}

interface ToolCardProps {
  tool: Tool;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

export function ToolCard({ tool, index, onDelete, onEdit }: ToolCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const faviconUrl = getFaviconUrl(tool.url);

  const handleDelete = () => {
    onDelete(tool.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          duration: 0.3,
          delay: index * 0.05,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="group relative"
      >
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-card hover:bg-secondary border border-border rounded-2xl p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
              {faviconUrl ? (
                <img
                  src={faviconUrl}
                  alt=""
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden",
                    );
                  }}
                />
              ) : null}
              <span
                className={`text-lg font-bold text-primary ${faviconUrl ? "hidden" : ""}`}
              >
                {getInitial(tool.name)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-lg mb-1 truncate group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {tool.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </p>
            </div>

            <ExternalLink className="w-5 h-13 -translate-x-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        </a>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="absolute top-2 -right-2 w-8 h-8 bg-destructive hover:bg-destructive/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
        >
          <Trash2 className="w-4 h-4 text-destructive-foreground" />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(tool.id);
          }}
          className="absolute top-14 -right-2 w-8 h-8 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
        >
          <Edit className="w-4 h-4 text-black" />
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-sm"
            >
              <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Eliminar Herramienta
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <p className="text-muted-foreground mb-6">
                  ¿Seguro que deseas eliminar <strong>"{tool.name}"</strong>?
                  Esta acción no se puede deshacer.
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
