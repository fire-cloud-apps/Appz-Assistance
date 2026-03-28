// Iconify icon web component type declarations
// This file provides TypeScript types for the iconify-icon web component

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': {
        icon: string
        width?: string | number
        height?: string | number
        color?: string
        style?: React.CSSProperties
        className?: string
        'aria-hidden'?: boolean
        'aria-label'?: string
        flip?: string
        rotate?: number | string
        hFlip?: boolean
        vFlip?: boolean
        onLoad?: () => void
        onError?: (error: Event) => void
      }
    }
  }
}

export {}
