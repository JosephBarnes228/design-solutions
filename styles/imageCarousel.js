// animate header
function animateHeader() {
    const imageBlock1 = document.querySelector('.slider-image-block-1');
    const imageBlock2 = document.querySelector('.slider-image-block-2');
    const firstImage = document.querySelector('.slider-image.is-1st');
    const secondImage = document.querySelector('.slider-image.is-2nd');
    const lastImage = document.querySelector('.slider-image-last');
    setInterval(() => {
      if (imageBlock1.style.width === '100vw' && imageBlock2.style.width === '100vw') {
        imageBlock1.style.width = '0vw';
        firstImage.style.transform = 'translate3d(-20vw, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)';
        secondImage.style.transform = 'translate3d(0vw, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)';
        lastImage.style.transform = 'translate3d(20vw, 0px, 0px) scale3d(1.3, 1.3, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)';
      } else if (imageBlock2.style.width === '100vw') {
        imageBlock2.style.width = '0vw';
        firstImage.style.transform = 'translate3d(0vw, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)';
        secondImage.style.transform = 'translate3d(-20vw, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)';
        lastImage.style.transform = 'translate3d(0vw, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)';
      } else {
        imageBlock1.style.width = '100vw';
        imageBlock2.style.width = '100vw';
        firstImage.style.transform = 'translate3d(0vw, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)';
        secondImage.style.transform = 'translate3d(20vw, 0px, 0px) scale3d(1.3, 1.3, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)';
        lastImage.style.transform = 'translate3d(0vw, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)';
      }
    }, 4000);
}

document.addEventListener('DOMContentLoaded', function() {
    animateHeader();
  });