
export default function Sidebar({ children, position = 'left' }){
return (
<div className={`w-1/4 border-${position} overflow-auto p-2`}>{children}</div>
)
}