export const STAGES = [
  { id: 'new_client',           label: 'New Client',          color: 'bg-slate-100 text-slate-700',   dot: 'bg-slate-400' },
  { id: 'design_in_process',    label: 'Design in Process',   color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
  { id: 'forward_to_designer',  label: 'Forward to Designer', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  { id: 'receive_from_design',  label: 'Receive from Design', color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  { id: 'presentation_prep',    label: 'Presentation Prep',   color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500' },
  { id: 'forward_to_pm',        label: 'Forward to PM',       color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  { id: 'approved',             label: 'Approved / Live',     color: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  { id: 'changes_requested',    label: 'Changes Requested',   color: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
] as const

export type StageId = typeof STAGES[number]['id']

export function getStage(id: string) {
  return STAGES.find(s => s.id === id) ?? STAGES[0]
}

export const NEXT_STAGE: Record<string, string> = {
  new_client:          'design_in_process',
  design_in_process:   'forward_to_designer',
  forward_to_designer: 'receive_from_design',
  receive_from_design: 'presentation_prep',
  presentation_prep:   'forward_to_pm',
  forward_to_pm:       'approved',
  changes_requested:   'forward_to_designer',
}
