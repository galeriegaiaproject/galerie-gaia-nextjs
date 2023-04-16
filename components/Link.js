import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'

const ActiveLink = ({
  children,
  activeClassName,
  className,
  activeStyle,
  style,
  ...props
}) => {
  const { asPath, isReady } = useRouter()
  const [computedClassName, setComputedClassName] = useState(className)
  const [computedStyle, setComputedStyle] = useState(style)

  useEffect(() => {
    // Check if the router fields are updated client-side
    if (isReady) {
      // Dynamic route will be matched via props.as
      // Static route will be matched via props.href
      const linkPathname = new URL((props.as || props.href), location.href).pathname

      // Using URL().pathname to get rid of query and hash
      const activePathname = new URL(asPath, location.href).pathname

      const newClassName =
        linkPathname === activePathname
          ? `${className} ${activeClassName}`.trim()
          : className

      if (newClassName !== computedClassName) {
        setComputedClassName(newClassName)
      }

      const newStyle =
        linkPathname === activePathname
          ? { ...(style || {}), ...(activeStyle || {}) }
          : (style || {})

      if (JSON.stringify(newStyle) !== JSON.stringify(computedStyle)) {
        setComputedStyle(newStyle)
      }
    }
  }, [
    asPath,
    isReady,
    props.as,
    props.href,
    activeClassName,
    className,
    computedClassName,
    activeStyle,
    style,
    computedStyle,
  ])

  return (
    <NextLink className={computedClassName} style={computedStyle} {...props}>
      {children}
    </NextLink>
  )
}

const Link = ({ children, to, activeClassName, activeStyle, ...props }) => /^\/(?!\/)/.test(to) ? (
  <ActiveLink href={to} activeClassName={activeClassName} activeStyle={activeStyle} {...props}>
    {children}
  </ActiveLink>
) : (
  <a href={to} target="_blank" rel="noopener noreferrer" {...props}>
    {children}
  </a>
)

export default Link
