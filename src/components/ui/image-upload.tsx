'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value: string[]
  onChange: (images: string[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  accept?: string
  disabled?: boolean
}

interface UploadedFile {
  file: File
  url: string
  uploading: boolean
  uploaded: boolean
  error?: string
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  maxSize = 5,
  accept = 'image/*',
  disabled = false
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please upload only image files'
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    return null
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Upload failed')
    }

    const data = await response.json()
    return data.url
  }

  const processFiles = async (files: File[]) => {
    const remainingSlots = maxFiles - value.length
    const filesToProcess = files.slice(0, remainingSlots)

    const newUploadedFiles: UploadedFile[] = filesToProcess.map(file => {
      const error = validateFile(file)
      return {
        file,
        url: URL.createObjectURL(file),
        uploading: !error,
        uploaded: false,
        error: error || undefined
      }
    })

    setUploadedFiles(prev => [...prev, ...newUploadedFiles])

    // Upload valid files
    const validFiles = newUploadedFiles.filter(f => !f.error)
    const uploadPromises = validFiles.map(async (uploadedFile, index) => {
      try {
        const uploadedUrl = await uploadFile(uploadedFile.file)
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === uploadedFile.file 
              ? { ...f, uploading: false, uploaded: true, url: uploadedUrl }
              : f
          )
        )

        // Update the parent component
        const newImages = [...value, uploadedUrl]
        onChange(newImages)
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === uploadedFile.file 
              ? { ...f, uploading: false, error: error instanceof Error ? error.message : 'Upload failed' }
              : f
          )
        )
      }
    })

    await Promise.all(uploadPromises)
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await processFiles(files)
    }
  }, [disabled, maxFiles, value.length])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length > 0) {
      await processFiles(files)
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const removeImage = (imageUrl: string) => {
    const newImages = value.filter(url => url !== imageUrl)
    onChange(newImages)
    
    // Remove from uploaded files as well
    setUploadedFiles(prev => prev.filter(f => f.url !== imageUrl))
  }

  const removeUploadedFile = (file: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== file))
  }

  const canUploadMore = value.length + uploadedFiles.filter(f => f.uploaded).length < maxFiles

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUploadMore && !disabled && (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Upload className={`h-10 w-10 mb-4 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragOver ? 'Drop images here' : 'Drag & drop images here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum {maxFiles} images, up to {maxSize}MB each
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Uploaded Files in Progress */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedFiles.map((uploadedFile, index) => (
            <Card key={index} className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-lg">
                <Image
                  src={uploadedFile.url}
                  alt="Uploading"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                
                {/* Status Overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  {uploadedFile.uploading && (
                    <div className="flex flex-col items-center space-y-2 text-white">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-xs">Uploading...</span>
                    </div>
                  )}
                  
                  {uploadedFile.uploaded && (
                    <div className="flex flex-col items-center space-y-2 text-white">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <span className="text-xs">Uploaded</span>
                    </div>
                  )}
                  
                  {uploadedFile.error && (
                    <div className="flex flex-col items-center space-y-2 text-white p-2">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                      <span className="text-xs text-center">{uploadedFile.error}</span>
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeUploadedFile(uploadedFile.file)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Existing Images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((imageUrl, index) => (
            <Card key={imageUrl} className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-lg">
                <Image
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                
                {/* Remove Button */}
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(imageUrl)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Status Message */}
      {maxFiles > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {value.length} of {maxFiles} images uploaded
          {value.length >= maxFiles && ' (maximum reached)'}
        </p>
      )}
    </div>
  )
}