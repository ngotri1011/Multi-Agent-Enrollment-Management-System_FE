type FileUploaderProps = {
  onFilesSelected: (files: FileList) => void
}

export function FileUploader({ onFilesSelected }: FileUploaderProps) {
  return (
    <input
      type="file"
      onChange={(event) => {
        if (event.target.files) {
          onFilesSelected(event.target.files)
        }
      }}
    />
  )
}

