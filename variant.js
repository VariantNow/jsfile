
// Wait for the GrowthBook SDK to load before running
window.growthbook_queue = window.growthbook_queue || [];
window.growthbook_queue.push((gb) => {
  console.log('[Variant Thumbnail Selector] Initializing script');
  
  const applyFeatureFlags = () => {
    console.log('[Variant Thumbnail Selector] Checking feature flag status');
    
    if (gb.isOn("f-you-feature-key")) {
      console.log('[Variant Thumbnail Selector] Feature flag is ON - applying thumbnail variant selector');
      initializeThumbnailVariantSelector();
    } else {
      console.log('[Variant Thumbnail Selector] Feature flag is OFF - reverting to original');
      revertToOriginalSelector();
    }
  };

  const initializeThumbnailVariantSelector = () => {
    try {
      // Find the variant-radios element
      const variantRadios = document.querySelector('variant-radios');
      if (!variantRadios) {
        console.log('[Variant Thumbnail Selector] variant-radios element not found');
        return;
      }
      console.log('[Variant Thumbnail Selector] Found variant-radios element');

      // Get the fieldset containing the radio buttons
      const fieldset = variantRadios.querySelector('fieldset');
      if (!fieldset) {
        console.log('[Variant Thumbnail Selector] fieldset not found');
        return;
      }

      // Check if we've already transformed this element
      if (fieldset.querySelector('.variant-thumbnail-container')) {
        console.log('[Variant Thumbnail Selector] Already transformed, skipping');
        return;
      }

      // Get variant data from the script tag
      const scriptTag = variantRadios.querySelector('script[type="application/json"]');
      if (!scriptTag) {
        console.log('[Variant Thumbnail Selector] Variant data script not found');
        return;
      }

      let variantData;
      try {
        variantData = JSON.parse(scriptTag.textContent);
        console.log('[Variant Thumbnail Selector] Parsed variant data:', variantData.length, 'variants');
      } catch (e) {
        console.error('[Variant Thumbnail Selector] Error parsing variant data:', e);
        return;
      }

      // Hide the original radio buttons and labels
      const radioInputs = fieldset.querySelectorAll('input[type="radio"]');
      const labels = fieldset.querySelectorAll('label');
      
      radioInputs.forEach(input => {
        input.style.display = 'none';
      });
      
      labels.forEach(label => {
        label.style.display = 'none';
      });

      // Create thumbnail container
      const thumbnailContainer = document.createElement('div');
      thumbnailContainer.className = 'variant-thumbnail-container';
      
      // Add styles
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .variant-thumbnail-container {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 12px;
          padding: 8px 0;
        }
        
        .variant-thumbnail {
          position: relative;
          cursor: pointer;
          border: 2px solid transparent;
          border-radius: 4px;
          overflow: hidden;
          transition: all 0.2s ease;
          width: 80px;
          height: 80px;
          padding: 4px;
        }
        
        .variant-thumbnail:hover {
          border-color: #ccc;
          transform: scale(1.05);
        }
        
        .variant-thumbnail.selected {
          border-color: #000;
          box-shadow: 0 0 0 1px #000;
        }
        
        .variant-thumbnail.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .variant-thumbnail.disabled::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 45%, rgba(0,0,0,0.3) 50%, transparent 55%);
        }
        
        .variant-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 2px;
        }
        
        .variant-thumbnail-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 11px;
          padding: 2px 4px;
          text-align: center;
          text-transform: capitalize;
        }
        
        @media (max-width: 768px) {
          .variant-thumbnail-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
            gap: 10px;
          }
          
          .variant-thumbnail {
            width: 100%;
            height: auto;
            aspect-ratio: 1;
          }
        }
      `;
      
      if (!document.querySelector('#variant-thumbnail-styles')) {
        styleElement.id = 'variant-thumbnail-styles';
        document.head.appendChild(styleElement);
        console.log('[Variant Thumbnail Selector] Styles injected');
      }

      // Create thumbnails for each variant
      variantData.forEach((variant, index) => {
        const radioInput = fieldset.querySelector(`input[value="${variant.option1}"]`);
        if (!radioInput) {
          console.log(`[Variant Thumbnail Selector] Radio input not found for variant: ${variant.option1}`);
          return;
        }

        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.className = 'variant-thumbnail';
        
        // Check if variant is selected
        if (radioInput.checked) {
          thumbnailDiv.classList.add('selected');
        }
        
        // Check if variant is disabled
        if (radioInput.classList.contains('disabled') || !variant.available) {
          thumbnailDiv.classList.add('disabled');
        }

        // Create image element
        const img = document.createElement('img');
        if (variant.featured_image && variant.featured_image.src) {
          img.src = variant.featured_image.src;
          img.alt = variant.featured_image.alt || `${variant.title} variant`;
        } else {
          // Fallback image if no featured image
          img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
          img.alt = 'No image available';
        }
        
        // Create label
        const label = document.createElement('div');
        label.className = 'variant-thumbnail-label';
        label.textContent = variant.option1;

        thumbnailDiv.appendChild(img);
        thumbnailDiv.appendChild(label);

        // Add click handler
        thumbnailDiv.addEventListener('click', function() {
          if (thumbnailDiv.classList.contains('disabled')) {
            console.log(`[Variant Thumbnail Selector] Clicked disabled variant: ${variant.option1}`);
            return;
          }
          
          console.log(`[Variant Thumbnail Selector] Clicked variant: ${variant.option1}`);
          
          // Remove selected class from all thumbnails
          thumbnailContainer.querySelectorAll('.variant-thumbnail').forEach(thumb => {
            thumb.classList.remove('selected');
          });
          
          // Add selected class to clicked thumbnail
          thumbnailDiv.classList.add('selected');
          
          // Click the corresponding radio button
          radioInput.click();
          
          // Trigger change event to ensure Shopify's variant selection logic runs
          const changeEvent = new Event('change', { bubbles: true });
          radioInput.dispatchEvent(changeEvent);
          
          console.log(`[Variant Thumbnail Selector] Selected variant: ${variant.option1}, ID: ${variant.id}`);
        });

        thumbnailContainer.appendChild(thumbnailDiv);
      });

      // Insert the thumbnail container after the legend
      const legend = fieldset.querySelector('legend');
      if (legend && legend.nextSibling) {
        fieldset.insertBefore(thumbnailContainer, legend.nextSibling);
      } else {
        fieldset.appendChild(thumbnailContainer);
      }
      
      console.log('[Variant Thumbnail Selector] Thumbnail selector created successfully');

      // Listen for variant changes triggered by other parts of the page
      fieldset.addEventListener('change', function(e) {
        if (e.target.type === 'radio') {
          console.log(`[Variant Thumbnail Selector] External variant change detected: ${e.target.value}`);
          updateThumbnailSelection(e.target.value);
        }
      });

    } catch (error) {
      console.error('[Variant Thumbnail Selector] Error initializing thumbnail selector:', error);
    }
  };

  const updateThumbnailSelection = (selectedValue) => {
    const thumbnailContainer = document.querySelector('.variant-thumbnail-container');
    if (!thumbnailContainer) return;

    const variantRadios = document.querySelector('variant-radios');
    const scriptTag = variantRadios.querySelector('script[type="application/json"]');
    const variantData = JSON.parse(scriptTag.textContent);

    thumbnailContainer.querySelectorAll('.variant-thumbnail').forEach((thumb, index) => {
      if (variantData[index].option1 === selectedValue) {
        thumb.classList.add('selected');
      } else {
        thumb.classList.remove('selected');
      }
    });
  };

  const revertToOriginalSelector = () => {
    console.log('[Variant Thumbnail Selector] Reverting to original selector');
    
    const variantRadios = document.querySelector('variant-radios');
    if (!variantRadios) return;

    const fieldset = variantRadios.querySelector('fieldset');
    if (!fieldset) return;

    // Remove thumbnail container
    const thumbnailContainer = fieldset.querySelector('.variant-thumbnail-container');
    if (thumbnailContainer) {
      thumbnailContainer.remove();
      console.log('[Variant Thumbnail Selector] Removed thumbnail container');
    }

    // Show original radio buttons and labels
    const radioInputs = fieldset.querySelectorAll('input[type="radio"]');
    const labels = fieldset.querySelectorAll('label');
    
    radioInputs.forEach(input => {
      input.style.display = '';
    });
    
    labels.forEach(label => {
      label.style.display = '';
    });

    console.log('[Variant Thumbnail Selector] Original selector restored');
  };

  // Initial application
  applyFeatureFlags();
  
  // Listen for GrowthBook data updates
  document.addEventListener("growthbookdata", applyFeatureFlags);
  
  // Also listen for DOM changes in case the product info is loaded dynamically
  const observer = new MutationObserver(() => {
    const variantRadios = document.querySelector('variant-radios');
    if (variantRadios && gb.isOn("f-you-feature-key")) {
      console.log('[Variant Thumbnail Selector] DOM change detected, reapplying feature');
      initializeThumbnailVariantSelector();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('[Variant Thumbnail Selector] Script initialization complete');
});
