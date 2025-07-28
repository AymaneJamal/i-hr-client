export interface Employee {
  id: string
  cin: string
  cnss: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  position: string
  contractType: "CDI" | "CDD" | "STAGE" | "PERIODE_ESSAI"
  startDate: string
  endDate?: string
  salary: number
  status: "ACTIF" | "INACTIF" | "ARCHIVE"
  avatar?: string
}

export interface Department {
  id: string
  name: string
  manager: string
  employeeCount: number
  color: string
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  department: string
  type: "CONGE_ANNUEL" | "CONGE_MALADIE" | "CONGE_MATERNITE" | "CONGE_EXCEPTIONNEL"
  startDate: string
  endDate: string
  days: number
  reason: string
  status: "EN_ATTENTE" | "APPROUVE" | "REFUSE"
  requestDate: string
  approvedBy?: string
  approvedDate?: string
}

export interface Absence {
  id: string
  employeeId: string
  employeeName: string
  date: string
  type: "RETARD" | "ABSENCE_JUSTIFIEE" | "ABSENCE_NON_JUSTIFIEE"
  duration: number // en heures
  reason?: string
  justified: boolean
}
