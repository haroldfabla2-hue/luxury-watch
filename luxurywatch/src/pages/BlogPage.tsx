import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

/**
 * Página de Blog con CMS
 * Sistema completo de gestión de contenido educativo
 */

interface BlogPost {
  id: number
  title: string
  content: string
  excerpt?: string
  category_id?: number
  author_id?: string
  published: boolean
  featured_image_url?: string
  created_at: string
  updated_at: string
}

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePost = async () => {
    if (!currentPost?.title || !currentPost?.content) {
      alert('Por favor completa título y contenido')
      return
    }

    try {
      if (currentPost.id) {
        // Update
        const { error } = await supabase
          .from('blog_posts')
          .update({
            ...currentPost,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentPost.id)

        if (error) throw error
      } else {
        // Insert
        const { error } = await supabase.from('blog_posts').insert([
          {
            ...currentPost,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (error) throw error
      }

      setIsEditing(false)
      setCurrentPost(null)
      await loadPosts()
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Error al guardar artículo')
    }
  }

  const deletePost = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este artículo?')) return

    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)

      if (error) throw error
      await loadPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error al eliminar artículo')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-headline font-bold text-gold-500">
              Blog - LuxuryWatch
            </h1>
            <button
              onClick={() => {
                setCurrentPost({ title: '', content: '', published: false })
                setIsEditing(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-neutral-900 rounded-md hover:bg-gold-600 transition-colors font-semibold"
            >
              <Plus size={20} />
              Nuevo Artículo
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {isEditing ? (
          // Editor
          <div className="bg-white rounded-lg shadow-card p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-headline font-bold mb-6">
              {currentPost?.id ? 'Editar Artículo' : 'Nuevo Artículo'}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={currentPost?.title || ''}
                  onChange={(e) =>
                    setCurrentPost({ ...currentPost, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Título del artículo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Extracto
                </label>
                <textarea
                  value={currentPost?.excerpt || ''}
                  onChange={(e) =>
                    setCurrentPost({ ...currentPost, excerpt: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Breve descripción..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Contenido *
                </label>
                <textarea
                  value={currentPost?.content || ''}
                  onChange={(e) =>
                    setCurrentPost({ ...currentPost, content: e.target.value })
                  }
                  rows={15}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono text-sm"
                  placeholder="Contenido del artículo (soporta Markdown)..."
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentPost?.published || false}
                    onChange={(e) =>
                      setCurrentPost({ ...currentPost, published: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium text-neutral-700">
                    Publicar artículo
                  </span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={savePost}
                  className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-neutral-900 rounded-md hover:bg-gold-600 transition-colors font-semibold"
                >
                  <Save size={20} />
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setCurrentPost(null)
                  }}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors font-semibold"
                >
                  <X size={20} />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Lista de artículos
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-luxury-lg transition-shadow"
              >
                {post.featured_image_url && (
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-headline font-bold text-neutral-900 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
                    {post.excerpt || post.content.substring(0, 150) + '...'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {post.published ? 'Publicado' : 'Borrador'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCurrentPost(post)
                          setIsEditing(true)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isEditing && posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg mb-4">
              No hay artículos aún. Crea el primero!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogPage
