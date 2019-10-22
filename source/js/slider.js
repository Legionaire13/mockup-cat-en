(function handleSliderAnimation() {
  const slider = document.querySelector(".slider")
  const catBeforeElement = document.querySelector(".slider__cat-before")
  const catAfterElement = document.querySelector(".slider__cat-after")
  const sliderThumb = document.querySelector(".slider__range")


  // mobile events
  const mobileButtonsHandler = (event) => {
    function showCatAfterElement() {
      slider.classList.remove("slider--before")
      slider.classList.add("slider--after")
      catBeforeElement.style.opacity = "0"
      catAfterElement.style.opacity = "1"
    }

    function hideCatAfterElement() {
      slider.classList.remove("slider--after")
      slider.classList.add("slider--before")
      catBeforeElement.style.opacity = "1"
      catAfterElement.style.opacity = "0"
    }

    if (event.target.classList.contains("slider__button")) {
      event.stopPropagation()

      if (slider.classList.contains("slider--before")) {
        showCatAfterElement()
      } else {
        hideCatAfterElement()
      }
    }

    if (event.target.classList.contains("slider__label--before")) {
      hideCatAfterElement()
    }

    if (event.target.classList.contains("slider__label--after")) {
      showCatAfterElement()
    }
  }

  if (slider.offsetWidth < 768) {
    slider.addEventListener("click", mobileButtonsHandler)
  }




  // tablet and desktops
  const sliderThumbHandler = () => {
    catBeforeElement.style.transition = ""
    catBeforeElement.style.width = (172 + 17 + ((408 - 17)/100 * sliderThumb.value)).toFixed() + "px"
  }

  const buttonsHandler = () => {
    const setAttributesToSlider = (thumbPosition, imageWidth) => {
      sliderThumb.value = thumbPosition;
      catBeforeElement.style.width = imageWidth
    }

    event.stopPropagation()

    catBeforeElement.style.transition = "all .3s"

    if (event.target.classList.contains("slider__label--before")) {
      setAttributesToSlider(100, "580px")
    }

    if (event.target.classList.contains("slider__label--after")) {
      setAttributesToSlider(0, "189px")
    }
  }

  if (slider.offsetWidth >= 768) {
    sliderThumb.addEventListener("input", sliderThumbHandler)
    slider.addEventListener("click", buttonsHandler)
  }
}());