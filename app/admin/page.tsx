"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, UserPlus, Trash2, X, Eye, EyeOff, ArrowLeft, Users, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EditUserModal } from "@/components/edit-user-modal"

interface User {
  id: string
  username: string
  created_at: string
}

export default function AdminPage() {
  const [adminPassword, setAdminPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const router = useRouter()

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        headers: { "x-admin-password": adminPassword }
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (err) {
      console.error("Error fetching users:", err)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers()
    }
  }, [isAuthenticated])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/users", {
        headers: { "x-admin-password": adminPassword }
      })

      if (response.ok) {
        setIsAuthenticated(true)
        const data = await response.json()
        setUsers(data)
      } else {
        setError("Contraseña de administrador incorrecta")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!newUsername.trim() || !newPassword.trim()) {
      setError("Usuario y contraseña son requeridos")
      return
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword
        },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al crear usuario")
        return
      }

      setSuccess(`Usuario "${newUsername}" creado exitosamente`)
      setNewUsername("")
      setNewPassword("")
      fetchUsers()
    } catch {
      setError("Error de conexión")
    }
  }

  const handleDeleteUser = async (id: string, username: string) => {
    if (!confirm(`¿Seguro que deseas eliminar al usuario "${username}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": adminPassword }
      })

      if (response.ok) {
        setSuccess(`Usuario "${username}" eliminado`)
        fetchUsers()
      } else {
        setError("Error al eliminar usuario")
      }
    } catch {
      setError("Error de conexión")
    }
  }

  const handleEditUser = async (id: string, username: string, password: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword
        },
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        setSuccess(`Usuario "${username}" actualizado`)
        fetchUsers()
      } else {
        const data = await response.json()
        setError(data.error || "Error al actualizar usuario")
      }
    } catch {
      setError("Error de conexión")
    }
  }

  const openEditModal = (id: string) => {
    const user = users.find(u => u.id === id)
    if (user) {
      setEditingUser(user)
      setIsEditModalOpen(true)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="w-8 h-8 text-amber-500" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">Gestión de usuarios</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-xl"
          >
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Contraseña Maestra
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa la contraseña de admin"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-secondary border-border focus:border-amber-500 focus:ring-amber-500 text-foreground placeholder:text-muted-foreground pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Acceder
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={() => router.push("/login")}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al login
              </button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">{users.length} usuarios</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Salir
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center justify-between"
            >
              <span>{error}</span>
              <button onClick={() => setError("")}>
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl flex items-center justify-between"
            >
              <span>{success}</span>
              <button onClick={() => setSuccess("")}>
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Agregar Usuario
          </h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Usuario
                </label>
                <Input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-secondary border-border focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-secondary border-border focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Crear Usuario
            </Button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Usuarios Registrados
          </h2>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay usuarios registrados
            </p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
{users.map((user) => (
                   <motion.div
                     key={user.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="flex items-center justify-between p-4 bg-secondary rounded-xl group"
                   >
                     <div>
                       <p className="font-medium text-foreground">{user.username}</p>
                       <p className="text-xs text-muted-foreground">
                         Creado: {new Date(user.created_at).toLocaleDateString()}
                       </p>
                     </div>
                     <div className="flex items-center gap-1">
                       <button
                         onClick={() => openEditModal(user.id)}
                         className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                       <button
                         onClick={() => handleDeleteUser(user.id, user.username)}
                         className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   </motion.div>
                 ))}
              </AnimatePresence>
            </div>
          )}
</motion.div>
       </div>

<EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingUser(null)
          }}
          onEdit={handleEditUser}
          user={editingUser}
        />
     </main>
   )
 }
