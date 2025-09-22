
import { Link } from 'react-router-dom'


export default function Header(){
return (
<header className="p-3 bg-green-700 text-white flex justify-between">
<h1 className="font-bold">AgriSat Dashboard</h1>
<Link to="/" className="underline">Logout</Link>
</header>
)
}