const root = document.getElementById('root')!;
const uploadId = new URLSearchParams(window.location.search).get('upload');

if (uploadId) {
  void import('../uploadedViewer').then(({ mountUploadedViewer }) => mountUploadedViewer(root, uploadId));
} else {
  void import('./historyPopup').then(({ mountHistoryPopup }) => mountHistoryPopup(root));
}
