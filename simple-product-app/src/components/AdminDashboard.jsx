import { useEffect, useState } from 'react';
import { PulseLoader } from 'react-spinners';
import { FaPlus, FaPen, FaTrash, FaXmark } from 'react-icons/fa6';
import { productService } from '../services/api';
import '../App.css';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [stock, setStock] = useState('50');
  
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching admin products:', err);
      setError('Unable to load products. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('electronics'); // Default category
    setImage('');
    setStock('50');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (prod) => {
    setEditingId(prod.id);
    setTitle(prod.title);
    setDescription(prod.description || '');
    setPrice(String(prod.price));
    setCategory(prod.category || '');
    setImage(prod.image || '');
    setStock(String(prod.stock || 50));
    setFormError('');
    setIsFormOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter(p => String(p.id) !== String(id)));
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !price || !category.trim()) {
      setFormError('Please fill out all required fields (Title, Price, Category)');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const productData = {
      title,
      description,
      price: parseFloat(price),
      category,
      image: image.trim() || 'https://via.placeholder.com/150',
      stock: parseInt(stock) || 0
    };

    try {
      if (editingId) {
        const updated = await productService.updateProduct(editingId, productData);
        setProducts(products.map(p => String(p.id) === String(editingId) ? updated : p));
      } else {
        const created = await productService.createProduct(productData);
        setProducts([created, ...products]);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error('Submit error:', err);
      setFormError(err.response?.data?.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loader-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <PulseLoader color="#6366f1" size={15} margin={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container" style={{ minHeight: '60vh' }}>
        <p style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: '600' }}>{error}</p>
        <button onClick={fetchProducts} className="cta-button" style={{ marginTop: '20px', border: 'none', cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container" style={{ justifyContent: 'flex-start', minHeight: 'calc(100vh - 120px)', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '40px 20px' }}>
      
      {/* Dashboard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Product Management</h2>
        <button onClick={handleOpenAddForm} className="cta-button" style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
          <FaPlus /> Add Product
        </button>
      </div>

      {/* Products Table/List */}
      <div className="cart-items" style={{ width: '100%', gap: '12px' }}>
        {products.length === 0 ? (
          <p>No products found in the catalog. Click "Add Product" to create one!</p>
        ) : (
          products.map((prod) => (
            <div key={prod.id} className="cart-item" style={{ gap: '20px', padding: '16px 24px', flexWrap: 'nowrap' }}>
              <img 
                src={prod.image} 
                alt={prod.title} 
                style={{ width: '70px', height: '70px', objectFit: 'contain', backgroundColor: 'white', padding: '2px', borderRadius: '8px' }} 
              />
              <div className="cart-item-details" style={{ textWrap: 'balance' }}>
                <p className="item-title" style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>{prod.title}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Category: <strong style={{ color: '#cbd5e1' }}>{prod.category}</strong></span>
                  <span>Stock: <strong style={{ color: prod.stock <= 5 ? '#ef4444' : '#10b981' }}>{prod.stock}</strong></span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <span className="item-total" style={{ fontSize: '1.2rem', whiteSpace: 'nowrap' }}>${prod.price.toFixed(2)}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleOpenEditForm(prod)}
                    className="cta-button" 
                    title="Edit Product"
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      backgroundColor: 'rgba(255,255,255,0.08)', 
                      color: '#fff', 
                      boxShadow: 'none', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer' 
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                  >
                    <FaPen style={{ fontSize: '0.9rem' }} />
                  </button>
                  <button 
                    onClick={() => handleDelete(prod.id, prod.title)}
                    className="remove-btn" 
                    title="Delete Product"
                    style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <FaTrash style={{ fontSize: '0.9rem' }} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form Overlay */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '600px', flexDirection: 'column', padding: '32px' }}>
            <button className="close-modal-btn" onClick={() => setIsFormOpen(false)}>
              <FaXmark />
            </button>
            
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px', color: '#fff' }}>
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h3>

            {formError && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="signin-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
              
              <div className="form-group">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Product Title *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Mens Cotton Jacket"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Price ($) *</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 59.99"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Initial Stock *</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="e.g. 100"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Category *</label>
                <div className="input-wrapper">
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '8px', 
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="electronics">Electronics</option>
                    <option value="jewelery">Jewelery</option>
                    <option value="men's clothing">Men's Clothing</option>
                    <option value="women's clothing">Women's Clothing</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Image URL</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter product description details..."
                  rows={3}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    background: 'rgba(255,255,255,0.04)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px', 
                    color: '#fff',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                className="signin-submit-btn"
                disabled={isSubmitting}
                style={{ marginTop: '10px' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="btn-spinner"></div>
                    Saving...
                  </>
                ) : (
                  editingId ? 'Update Product' : 'Add Product'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
