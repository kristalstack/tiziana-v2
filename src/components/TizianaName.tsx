import Link from "next/link";
export default function TizianaName({locale="es",className=""}:{locale?:string;className?:string}){
 return <Link href={`/${locale}/tiziana`} className={`tiziana-brand ${className}`}><em>Tiziana</em></Link>;
}
