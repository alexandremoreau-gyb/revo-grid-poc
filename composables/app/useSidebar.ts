export function useSidebar() {
  const collapsed = useState('sidebar-collapsed', () => false)
  return { collapsed }
}
