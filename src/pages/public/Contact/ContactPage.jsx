import { useState } from 'react'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { useContact } from '../../../features/contact/useContact'
import { useToast } from '../../../components/ui/Toast'
import './ContactPage.css'

export function ContactPage() {
  const { sendMessage, loading } = useContact()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const tempErrors = {}
    if (!formData.email) {
      tempErrors.email = 'El correo electrónico es obligatorio.'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Ingresa un correo electrónico válido.'
    }
    if (!formData.subject.trim()) {
      tempErrors.subject = 'El asunto es obligatorio.'
    }
    if (!formData.message.trim()) {
      tempErrors.message = 'El mensaje no puede estar vacío.'
    }
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for that field if any
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const res = await sendMessage(formData)

    if (res.success) {
      toast({
        type: 'success',
        message: 'Mensaje transmitido con éxito al servidor del Outsider.',
      })
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
    } else {
      toast({
        type: 'error',
        message: `Error al enviar mensaje: ${res.error}`,
      })
    }
  }

  return (
    <PageWrapper>
      <div className="vhs-scanlines vhs-noise"></div>
      
      <div className="contact-page container animate-fade-in">
        <div className="contact-page__grid">
          {/* Column 1: Info and Editorial stance */}
          <div className="contact-page__info">
            <div className="contact-page__header">
              <span className="contact-page__badge">SYS_COM</span>
              <h1 className="contact-page__title">CANAL DE RETROALIMENTACIÓN</h1>
              <p className="contact-page__subtitle">Línea directa para reportes, ideas o discrepancias</p>
            </div>

            <div className="contact-page__editorial">
              <div className="contact-page__terminal">
                <div className="terminal-header">
                  <span className="terminal-dot"></span>
                  <span className="terminal-dot"></span>
                  <span className="terminal-dot"></span>
                  <span className="terminal-title">readme.txt</span>
                </div>
                <div className="terminal-body font-mono">
                  <p className="color-accent">// BITÁCORA DE COMUNICACIÓN</p>
                  <p>Este canal es directo y libre de intermediación. No hay respuestas automáticas escritas por bots corporativos.</p>
                  <br />
                  <p>Si tienes discrepancias con las publicaciones del blog, ideas críticas, o quieres proponer proyectos sobre software libre, descentralización o liberación del conocimiento en la red, escribe aquí.</p>
                  <br />
                  <p>Solo internet crudo y comunicación de par a par.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Form */}
          <div className="contact-page__form-container">
            <h2 className="contact-page__form-title">
              <span className="color-accent">[</span> ENVIAR MENSAJE <span className="color-accent">]</span>
            </h2>
            
            <form onSubmit={handleSubmit} className="contact-page__form">
              <Input
                label="Nombre / Alias (Opcional)"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Anónimo"
                autoComplete="name"
                disabled={loading}
              />

              <Input
                label="Correo Electrónico (Requerido)"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@nodo-libre.net"
                error={errors.email}
                autoComplete="email"
                required
                disabled={loading}
              />

              <Input
                label="Asunto (Requerido)"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Propuesta, discrepancia o reporte..."
                error={errors.subject}
                required
                disabled={loading}
              />

              <Input
                label="Mensaje (Requerido)"
                name="message"
                textarea
                rows={6}
                value={formData.message}
                onChange={handleChange}
                placeholder="Escribe tu mensaje..."
                error={errors.message}
                required
                disabled={loading}
              />

              <div className="contact-page__form-actions">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  fullWidth
                >
                  ENVIAR TRANSMISIÓN
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
