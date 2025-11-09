// Type definitions for @google/model-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerJSX &
        React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

interface ModelViewerJSX {
  src?: string
  poster?: string
  alt?: string
  ar?: boolean
  'ar-modes'?: string
  'camera-controls'?: boolean
  'touch-action'?: string
  'auto-rotate'?: boolean
  'shadow-intensity'?: string
  'environment-image'?: string
  exposure?: string
  ref?: React.Ref<HTMLElement>
}

export {}
