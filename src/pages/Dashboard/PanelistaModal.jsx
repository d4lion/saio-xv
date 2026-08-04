import React, { useState, useRef } from 'react';
import { Users, X, Sparkles, Upload, Loader2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

export default function PanelistaModal({
  isOpen,
  onClose,
  mode,
  form,
  setForm,
  onSave
}) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef(null);

  if (!isOpen) return null;

  // Google-style tag chips logic
  const currentTags = (form.topicsInput || '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const addTag = (newTag) => {
    const trimmed = newTag.trim().replace(/,/g, '');
    if (!trimmed) return;
    if (currentTags.includes(trimmed)) return;
    const updated = [...currentTags, trimmed].join(', ');
    setForm(prev => ({ ...prev, topicsInput: updated }));
  };

  const removeTag = (indexToRemove) => {
    const updated = currentTags.filter((_, idx) => idx !== indexToRemove).join(', ');
    setForm(prev => ({ ...prev, topicsInput: updated }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Archivo no válido: Por favor selecciona una imagen (JPG, PNG, WEBP).');
      return;
    }

    try {
      setUploadingImage(true);
      toast.loading('Optimizando y procesando imagen...', { id: 'upload-img' });
      const compressedDataUrl = await adminService.uploadPanelistaPhoto(file);
      setForm(prev => ({ ...prev, photo: compressedDataUrl }));
      toast.success('Imagen optimizada y cargada con éxito.', { id: 'upload-img' });
    } catch (err) {
      console.error(err);
      toast.error(`Error al procesar la imagen: ${err.message}`, { id: 'upload-img' });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xl relative text-gray-900 max-h-[90vh] flex flex-col">
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-gray-150 p-5 bg-gray-50 flex-shrink-0">
          <h3 className="font-heading font-extrabold text-md text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>{mode === 'create' ? 'Registrar Nuevo Panelista' : 'Editar Datos del Panelista'}</span>
          </h3>
        </div>

        <form onSubmit={onSave} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Nombre & Iniciales */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Nombre Completo *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => {
                  const val = e.target.value;
                  const autoInitials = val ? val.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '';
                  setForm(prev => ({ 
                    ...prev, 
                    name: val,
                    initials: prev.initialsManuallyEdited ? prev.initials : autoInitials
                  }));
                }}
                placeholder="Ej: Dr. Alejandra Moreno"
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Iniciales</label>
              <input
                type="text"
                maxLength={4}
                value={form.initials}
                onChange={(e) => setForm(prev => ({ ...prev, initials: e.target.value.toUpperCase(), initialsManuallyEdited: true }))}
                placeholder="AM"
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs text-gray-900 outline-none font-bold uppercase transition-all duration-300"
              />
            </div>
          </div>

          {/* Cargo & Empresa */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Rol / Cargo *</label>
              <input
                type="text"
                required
                value={form.role}
                onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Ej: Directora de IA"
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Empresa *</label>
              <input
                type="text"
                required
                value={form.company}
                onChange={(e) => setForm(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Ej: Tech Latam"
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Biografía */}
          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Biografía *</label>
            <textarea
              required
              rows={3}
              value={form.bio}
              onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Breve trayectoria, logros y especialidades del ponente..."
              className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300 resize-none"
            />
          </div>

          {/* Google-Style Oval Tag Chips for Topics / Especialidades */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">
                Temas / Especialidades
              </label>
              <span className="text-[10px] text-purple-600 font-medium">Presiona Enter o Coma para agregar etiqueta</span>
            </div>

            <div 
              className="min-h-[42px] p-2 bg-white border border-gray-300 hover:border-gray-400 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 rounded-xl text-xs text-gray-900 transition-all duration-300 flex flex-wrap items-center gap-1.5 cursor-text"
              onClick={() => tagInputRef.current?.focus()}
            >
              {currentTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-xs transition-all"
                  style={{
                    backgroundColor: `${form.color || '#9c3aed'}18`,
                    borderColor: `${form.color || '#9c3aed'}45`,
                    color: form.color || '#9c3aed'
                  }}
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(idx);
                    }}
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors cursor-pointer"
                    title="Eliminar tema"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}

              <input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    if (tagInput.trim()) {
                      addTag(tagInput);
                      setTagInput('');
                    }
                  } else if (e.key === 'Backspace' && !tagInput && currentTags.length > 0) {
                    removeTag(currentTags.length - 1);
                  }
                }}
                onBlur={() => {
                  if (tagInput.trim()) {
                    addTag(tagInput);
                    setTagInput('');
                  }
                }}
                placeholder={currentTags.length === 0 ? "Escribe un tema y presiona Enter (ej: Machine Learning)" : "Añadir tema..."}
                className="flex-1 min-w-[140px] bg-transparent outline-none text-xs text-gray-900 p-1 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Color & Foto */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-3 gap-4 items-start">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Color distintivo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color || '#9c3aed'}
                    onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-9 h-9 p-0.5 border border-gray-300 rounded-lg cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#9c3aed"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Upload Foto / URL */}
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Foto del Ponente</label>
                
                <div className="flex items-center gap-3">
                  {/* Avatar Preview */}
                  {form.photo ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 shadow-sm flex-shrink-0 group">
                      <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, photo: '' }))}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Quitar foto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0 border-2 shadow-sm"
                      style={{ backgroundColor: form.color || '#9c3aed' }}
                    >
                      {form.initials || 'PN'}
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold cursor-pointer transition-colors shadow-sm">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-purple-600" />
                          <span>Cargar Imagen (Base64)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      value={form.photo && !form.photo.startsWith('data:') ? form.photo : ''}
                      onChange={(e) => setForm(prev => ({ ...prev, photo: e.target.value }))}
                      placeholder="O pega una URL externa de la foto..."
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">LinkedIn URL</label>
              <input
                type="text"
                value={form.linkedin || ''}
                onChange={(e) => setForm(prev => ({ ...prev, linkedin: e.target.value }))}
                placeholder="https://linkedin.com/in/usuario"
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-500">Twitter / X URL</label>
              <input
                type="text"
                value={form.twitter || ''}
                onChange={(e) => setForm(prev => ({ ...prev, twitter: e.target.value }))}
                placeholder="https://twitter.com/usuario"
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs text-gray-900 outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Checkbox Keynote / Ponente Destacado */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200 cursor-pointer hover:bg-purple-100/70 transition-colors">
              <input
                type="checkbox"
                checked={!!form.isFeatured}
                onChange={(e) => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Ponente Destacado / Keynote Principal</span>
                </div>
                <p className="text-[11px] text-purple-700">
                  Al marcar esta casilla, este ponente aparecerá en la sección superior destacada de la página pública.
                </p>
              </div>
            </label>
          </div>

          <div className="border-t border-gray-150 pt-4 mt-6 flex justify-end gap-2 bg-gray-50 -mx-5 -mb-5 p-5 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-heading text-xs font-semibold cursor-pointer transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploadingImage}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-heading text-xs font-semibold cursor-pointer transition-all duration-200 shadow-sm disabled:opacity-50"
            >
              {mode === 'create' ? 'Crear Panelista' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
