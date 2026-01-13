import React, { useEffect, useState } from 'react'
import Header from '../components/Header'

function SummaryCard({title, value}){
  return (
    <div className="card summary">
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
    </div>
  )
}

export default function Dashboard(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    fetch(`${API}/products`)
      .then(r => {
        if(!r.ok) throw new Error('Failed to fetch')
        return r.json()
      })
      .then(data => { if(mounted){ setProducts(data); setError(null) } })
      .catch(err => { if(mounted) setError(err.message) })
      .finally(()=> mounted && setLoading(false))
    return ()=> mounted = false
  }, [API])

  const totalSales = products.reduce((s,p)=> s + (p.sold || 0) * (p.price || 0), 0).toFixed(2)
  const itemsSold = products.reduce((s,p)=> s + (p.sold || 0), 0)

  async function updatePrice(id, newPrice){
    try{
      const product = products.find(p=>p.id===id)
      if(!product) return
      const body = {...product, price: parseFloat(newPrice)}
      const res = await fetch(`${API}/products/${id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(body)
      })
      if(!res.ok) throw new Error('Update failed')
      const updated = await res.json()
      setProducts(prev => prev.map(p => p.id===id ? updated : p))
    }catch(err){
      console.error(err)
      alert('Unable to update price')
    }
  }

  return (
    <div className="app-container">
      <Header />
      <main>
        <section className="summary-row">
          <SummaryCard title="Total Revenue" value={`$${totalSales}`} />
          <SummaryCard title="Items Sold" value={itemsSold} />
          <SummaryCard title="Products" value={products.length} />
        </section>

        {loading && <p>Loading products...</p>}
        {error && <p style={{color:'red'}}>{error}</p>}

        <section className="products-grid">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onSave={updatePrice} />
          ))}
        </section>
      </main>
    </div>
  )
}

function ProductCard({product, onSave}){
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(product.price)

  return (
    <div className="product-card">
      <img src={product.image_url || product.img || ''} alt={product.name} />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="desc">{product.description}</p>
        <div className="meta">
          {editing ? (
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <input type="number" step="0.01" value={value} onChange={e=>setValue(e.target.value)} />
              <button onClick={()=>{ onSave(product.id, value); setEditing(false) }}>Save</button>
              <button onClick={()=>{ setValue(product.price); setEditing(false) }}>Cancel</button>
            </div>
          ) : (
            <>
              <span className="price">${(product.price||0).toFixed(2)}</span>
              <span className="sold">Sold: {product.sold}</span>
              <button onClick={()=>setEditing(true)} style={{marginLeft:8}}>Edit Price</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
