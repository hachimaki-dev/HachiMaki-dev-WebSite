import { useState, useEffect } from 'react'
import { useAuth } from '../../../features/auth/useAuth'
import { useToast } from '../../../components/ui/Toast'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { PageLoader } from '../../../components/ui/PageLoader'
import { supabase } from '../../../lib/supabase'
import { TABLES } from '../../../lib/constants'
import './SettingsPage.css'

export function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
  })

  /* Load profile */
  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data } = await supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setForm({
          display_name: data.display_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        })
      }
      setLoading(false)
    }
    fetchProfile()
  }, [user])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from(TABLES.PROFILES)
        .upsert({
          id: user.id,
          ...form,
        })

      if (error) throw error
      toast({ type: 'success', message: 'Perfil actualizado' })
    } catch (err) {
      toast({ type: 'error', message: err.message })
    }
    setSaving(false)
  }

  /* Password change */
  const [passwordForm, setPasswordForm] = useState({ password: '', confirm: '' })
  const [changingPassword, setChangingPassword] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.password !== passwordForm.confirm) {
      toast({ type: 'error', message: 'Las contraseñas no coinciden' })
      return
    }
    if (passwordForm.password.length < 6) {
      toast({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres' })
      return
    }

    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.password,
      })
      if (error) throw error
      toast({ type: 'success', message: 'Contraseña actualizada' })
      setPasswordForm({ password: '', confirm: '' })
    } catch (err) {
      toast({ type: 'error', message: err.message })
    }
    setChangingPassword(false)
  }

  if (loading) return <PageLoader />

  return (
    <div className="settings page-enter">
      <h1 className="settings__title">Configuración</h1>

      {/* Profile */}
      <form className="settings__section" onSubmit={handleSaveProfile}>
        <h2 className="settings__section-title">Perfil</h2>

        <div className="settings__fields">
          <Input
            label="Nombre"
            value={form.display_name}
            onChange={handleChange('display_name')}
            placeholder="Tu nombre"
          />
          <Input
            label="Bio"
            value={form.bio}
            onChange={handleChange('bio')}
            placeholder="Cuéntanos sobre ti..."
            textarea
            rows={4}
          />
          <Input
            label="URL del avatar"
            value={form.avatar_url}
            onChange={handleChange('avatar_url')}
            placeholder="https://..."
          />
          {form.avatar_url && (
            <div className="settings__avatar-preview">
              <img src={form.avatar_url} alt="Avatar preview" />
            </div>
          )}
        </div>

        <Button type="submit" variant="primary" loading={saving}>
          Guardar perfil
        </Button>
      </form>

      {/* Password */}
      <form className="settings__section" onSubmit={handlePasswordChange}>
        <h2 className="settings__section-title">Cambiar contraseña</h2>

        <div className="settings__fields">
          <Input
            label="Nueva contraseña"
            type="password"
            value={passwordForm.password}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, password: e.target.value }))}
            placeholder="••••••••"
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" variant="secondary" loading={changingPassword}>
          Actualizar contraseña
        </Button>
      </form>

      {/* Account info */}
      <div className="settings__section">
        <h2 className="settings__section-title">Cuenta</h2>
        <p className="settings__info">
          Email: <strong>{user?.email}</strong>
        </p>
      </div>
    </div>
  )
}
