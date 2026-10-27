import { useMemo, useState } from 'react'
import {
  ArrowRight, Check, CheckCircle2, CircleHelp, Clock3, Copy, FileCheck2,
  GitBranch, Layers3, Menu, Pencil, Plus, RotateCcw, Send, Settings2,
  Sparkles, Trash2, UserRound, X, Zap,
} from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const examples = {
  'Employee Onboarding': 'Create an employee onboarding workflow. HR collects documents, verifies them, the manager approves the employee, IT creates an account, and HR sends a welcome email.',
  'Leave Approval': 'Create a leave approval workflow. The employee submits a leave request, the manager checks it and approves or rejects it, and the employee receives a notification.',
  'Expense Reimbursement': 'Create an expense reimbursement workflow. The employee submits a receipt, finance verifies it, the manager approves it, and finance processes the payment.',
}

const stepTypes = {
  input: [FileCheck2, 'blue', 'Input'],
  approval: [UserRound, 'purple', 'Approval'],
  notification: [Send, 'green', 'Notification'],
  decision: [GitBranch, 'orange', 'Decision'],
  action: [Settings2, 'orange', 'Action'],
  end: [CheckCircle2, 'green', 'End'],
}

function normalizeSteps(steps = []) {
  return steps.map((step, index) => {
    const [icon, tone, label] = stepTypes[step.type] || [Zap, 'blue', step.type || 'Step']
    return {
      id: step.id || `step-${index + 1}`,
      number: step.order || index + 1,
      name: step.name || `Step ${index + 1}`,
      type: label,
      dependency: step.dependsOn?.length ? `After ${step.dependsOn.join(', ')}` : index === 0 ? 'Starts workflow' : 'No dependency',
      icon,
      tone,
      rawType: step.type || 'action',
    }
  })
}

function Logo() {
  return <div className="brand"><div className="brand-mark"><GitBranch size={19} strokeWidth={2.5} /></div><div><div className="brand-name">FlowCraft</div><div className="brand-subtitle">AI Workflow Builder</div></div></div>
}

function StepCard({ step, onEdit, onDelete }) {
  const Icon = step.icon
  return <div className="step-row">
    <div className="step-number">{step.number}</div>
    <div className={`step-card ${step.tone}`}>
      <div className="step-card-main"><div className={`step-icon ${step.tone}`}><Icon size={18} /></div><div className="step-copy"><div className="step-title">{step.name}</div><div className="step-meta"><span>{step.type}</span><span className="meta-dot">•</span><span>{step.dependency}</span></div></div></div>
      <div className="step-actions"><button className="icon-button" aria-label={`Edit ${step.name}`} onClick={() => onEdit(step)}><Pencil size={15} /></button><button className="icon-button danger" aria-label={`Delete ${step.name}`} onClick={() => onDelete(step.id)}><Trash2 size={15} /></button></div>
    </div>
  </div>
}

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [workflow, setWorkflow] = useState({ title: 'Untitled Workflow', steps: [] })
  const [status, setStatus] = useState('Draft')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [newStep, setNewStep] = useState({ name: '', type: 'action', dependency: '' })
  const steps = workflow.steps
  const count = useMemo(() => `${steps.length} ${steps.length === 1 ? 'step' : 'steps'}`, [steps.length])

  function showNotice(message) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2800)
  }

  async function generateWorkflow() {
    if (!prompt.trim() || loading) return
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/generate-workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      const body = await response.text()
      let data = null
      if (body.trim()) {
        try {
          data = JSON.parse(body)
        } catch {
          throw new Error(body.trim().slice(0, 240) || `Request failed with status ${response.status}`)
        }
      }

      if (!response.ok) {
        const detail = data?.detail || `Request failed with status ${response.status}`
        throw new Error(typeof detail === 'string' ? detail : 'The backend could not generate a workflow.')
      }
      if (!data?.title || !Array.isArray(data.steps)) throw new Error('The backend returned an invalid workflow.')
      setWorkflow({ title: data.title, steps: normalizeSteps(data.steps) })
      setStatus('Draft')
      showNotice('Workflow generated successfully')
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Unable to connect to the workflow service.')
    } finally {
      setLoading(false)
    }
  }

  function openAddForm() {
    setNewStep({ name: '', type: 'action', dependency: steps.length ? `After Step ${steps.length}` : '' })
    setIsAddFormOpen(true)
  }

  function addStep(event) {
    event.preventDefault()
    if (!newStep.name.trim()) return
    const [icon, tone, label] = stepTypes[newStep.type] || [Zap, 'blue', 'Action']
    setWorkflow((current) => ({ ...current, steps: [...current.steps, { id: `step-${Date.now()}`, number: current.steps.length + 1, name: newStep.name.trim(), type: label, dependency: newStep.dependency.trim() || (current.steps.length ? `After Step ${current.steps.length}` : 'Starts workflow'), icon, tone, rawType: newStep.type }] }))
    setIsAddFormOpen(false)
    showNotice('New step added')
  }

  function deleteStep(id) {
    setWorkflow((current) => ({ ...current, steps: current.steps.filter((step) => step.id !== id).map((step, index) => ({ ...step, number: index + 1 })) }))
    showNotice('Step removed')
  }

  function editStep(step) {
    const name = window.prompt('Update step name', step.name)
    if (name?.trim()) setWorkflow((current) => ({ ...current, steps: current.steps.map((item) => item.id === step.id ? { ...item, name: name.trim() } : item) }))
  }

  function startNew() {
    setPrompt('')
    setWorkflow({ title: 'Untitled Workflow', steps: [] })
    setStatus('Draft')
    showNotice('Started a new workflow')
  }

  return <div className="app-shell">
    <header className="topbar"><Logo /><div className="topbar-actions"><button className="help-button" aria-label="Help"><CircleHelp size={18} /></button><button className="new-workflow-button" onClick={startNew}><Plus size={17} /> New Workflow</button><button className="mobile-menu" aria-label="Open menu"><Menu size={20} /></button></div></header>
    <main>
      <section className="hero-section"><div className="eyebrow"><span className="eyebrow-dot" /> Intelligent workflow design</div><h1>Turn business processes<br /><span>into workflows.</span></h1><p className="hero-description">Describe your process in plain English. Generate, customize,<br className="desktop-break" /> and finalize your workflow.</p>
        <div className="prompt-panel"><div className="prompt-label"><Sparkles size={16} /> Describe your process</div><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="e.g. When a new employee joins, collect their details..." /><div className="prompt-footer"><span className="prompt-hint">The more detail you provide, the better your workflow.</span><button className="generate-button" onClick={generateWorkflow} disabled={loading || !prompt.trim()}><Sparkles size={17} /> {loading ? 'Generating...' : 'Generate Workflow'} <ArrowRight size={17} /></button></div></div>
        <div className="example-row"><span className="example-label">Try an example</span>{Object.entries(examples).map(([label, value]) => <button key={label} className="prompt-chip" onClick={() => setPrompt(value)}>{label}</button>)}</div>
      </section>
      <section className="editor-section"><div className="editor-heading"><div><div className="section-kicker">WORKFLOW EDITOR</div><div className="workflow-title-wrap">{editingTitle ? <input autoFocus className="workflow-title-input" value={workflow.title} onChange={(event) => setWorkflow((current) => ({ ...current, title: event.target.value }))} onBlur={() => setEditingTitle(false)} onKeyDown={(event) => event.key === 'Enter' && setEditingTitle(false)} /> : <h2>{workflow.title}</h2>}<button className="edit-title" aria-label="Edit workflow title" onClick={() => setEditingTitle(true)}><Pencil size={14} /></button></div><div className="workflow-info"><span className="status-badge"><span /> {status}</span><span className="info-divider" /><Layers3 size={14} /> {count}</div></div><button className="more-button" aria-label="More workflow options"><span /><span /><span /></button></div>
        <div className="editor-toolbar"><button className="toolbar-primary" onClick={openAddForm}><Plus size={16} /> Add Step</button><div className="toolbar-spacer" /><button className="toolbar-button" onClick={generateWorkflow} disabled={loading || !prompt.trim()}><RotateCcw size={15} /> Regenerate</button><button className="toolbar-button" onClick={() => showNotice(steps.length ? 'Workflow is valid' : 'Generate or add a step first')}><CheckCircle2 size={15} /> Validate Workflow</button><button className="finalize-button" onClick={() => { setStatus('Finalized'); showNotice('Workflow finalized') }}><Check size={15} /> Finalize Workflow</button></div>
        {isAddFormOpen && <form className="add-step-form" onSubmit={addStep}><div className="add-form-heading"><div><div className="add-form-title"><Plus size={16} /> Add workflow step</div><div className="add-form-subtitle">Define the next action in your process.</div></div><button type="button" className="form-close" aria-label="Close add step form" onClick={() => setIsAddFormOpen(false)}><X size={16} /></button></div><div className="add-form-fields"><label>Step name<input autoFocus required value={newStep.name} onChange={(event) => setNewStep((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Notify the finance team" /></label><label>Step type<select value={newStep.type} onChange={(event) => setNewStep((current) => ({ ...current, type: event.target.value }))}>{Object.entries(stepTypes).map(([value, [, , label]]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Dependency <span className="optional-label">Optional</span><input value={newStep.dependency} onChange={(event) => setNewStep((current) => ({ ...current, dependency: event.target.value }))} placeholder="e.g. After manager approval" /></label></div><div className="add-form-actions"><button type="button" className="form-cancel" onClick={() => setIsAddFormOpen(false)}>Cancel</button><button type="submit" className="form-submit"><Plus size={15} /> Add Step</button></div></form>}
        <div className={`workflow-canvas ${steps.length === 0 ? 'empty' : ''}`}>{steps.length ? <div className="steps-list">{steps.map((step, index) => <div key={step.id} className="step-with-connector"><StepCard step={step} onEdit={editStep} onDelete={deleteStep} />{index < steps.length - 1 && <div className="connector"><span /></div>}</div>)}</div> : <div className="empty-state"><div className="empty-icon"><GitBranch size={24} /></div><h3>Your workflow will appear here</h3><p>Describe a process above and generate your workflow from the backend.</p><button className="empty-action" onClick={openAddForm}><Plus size={16} /> Add your first step</button></div>}</div>
        <div className="canvas-footer"><span><Clock3 size={14} /> Last saved just now</span><span><Copy size={14} /> JSON-ready workflow data</span></div>
      </section>
    </main>
    {notice && <div className="toast"><CheckCircle2 size={17} /> {notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={14} /></button></div>}
  </div>
}
