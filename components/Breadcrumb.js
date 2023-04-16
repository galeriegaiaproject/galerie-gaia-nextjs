import Link from 'next/link'

const Breadcrumb = ({ crumbs, current, ...props }) => (
  <nav className='breadcrumb'>
    <ul>
      {crumbs.map(({ label, path }, index, arr) => (
        <li key={index}>
          {index === (arr.length - 1) ? (
            <span>{current || label}</span>
          ) : (
            <Link href={path}>{label}</Link>
          )}
        </li>
      ))}
    </ul>
  </nav>
)

export default Breadcrumb
