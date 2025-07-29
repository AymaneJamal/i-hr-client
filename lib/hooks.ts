// lib/hooks.ts
import { useDispatch, useSelector } from '@/app/providers'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch = () => useDispatch()
export const useAppSelector = <TSelected>(selector: (state: RootState) => TSelected) => 
  useSelector(selector)