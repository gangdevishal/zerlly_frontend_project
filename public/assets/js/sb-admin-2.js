(function($) {
  "use strict"; // Start of use strict

  // Toggle the side navigation
  // $("#sidebarToggle, #sidebarToggleTop").on('click', function(e) {
  //   alert('s');
  //   $("body").toggleClass("sidebar-toggled");
  //   $(".sidebar").toggleClass("toggled");
  //   if ($(".sidebar").hasClass("toggled")) {
  //     $('.sidebar .collapse').collapse('hide');
  //   };
  // });

  // Close any open menu accordions when window is resized below 768px
  $(window).resize(function() {
    // if ($(window).width() < 768) {
    //   $('.sidebar .collapse').collapse('hide');
    // };
    
    // Toggle the side navigation when window is resized below 480px
    // if ($(window).width() < 480 && !$(".sidebar").hasClass("toggled")) {
    //   $("body").addClass("sidebar-toggled");
    //   $(".sidebar").addClass("toggled");
    //   $('.sidebar .collapse').collapse('hide');
    // };
  });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function(e) {
    if ($(window).width() > 768) {
      var e0 = e.originalEvent,
        delta = e0.wheelDelta || -e0.detail;
      this.scrollTop += (delta < 0 ? 1 : -1) * 30;
      e.preventDefault();
    }
  });

  // Scroll to top button appear
  $(document).on('scroll', function() {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Smooth scrolling using jQuery easing
  $(document).on('click', 'a.scroll-to-top', function(e) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top)
    }, 1000, 'easeInOutExpo');
    e.preventDefault();
  });

  // alert($(window).width());
  $(document).on('click',"#sidebarToggleTop", function(e) {
    $('.fixed-right i.fa-times').trigger("click");
    if ($(window).width() <= 480){
      if($(".sidebar").hasClass("mini-sidebar")){
        $(".header").css("left", "50px").css("right", "0px");
        $("#wrapper #content-wrapper").css("margin-left","60px");
      }
      else {
        $(".header").css("left", "0px").css("right", "0px");
        $("#wrapper #content-wrapper").css("margin-left","0");
      }     
    }
    else if ($(window).width() <= 768 && $(window).width() >= 481){
      if($(".sidebar").hasClass("mini-sidebar")){
        $(".header").css("left", "50px").css("right", "0px");
        $("#wrapper #content-wrapper").css("margin-left","60px");
      }
      else {
        $(".header").css("left", "0px").css("right", "0px");
        $("#wrapper #content-wrapper").css("margin-left","0");
      }     
    }  
  });

  // Manage Sidebar hover
  // $("#accordionSidebar").addClass("toggled") ;
  /*$(document).on('mouseout',"#accordionSidebar", function(e) {
    // alert('d');
    if ($(window).width() >= 1200){
      $(this).addClass("toggled") ;   
      // Add Header Class
      $(".header").css("left", "50px").css("right", "0px");
      $("#wrapper #content-wrapper").css("margin-left","60px");
    }
  });*/

  /*$(document).on('mouseover',"#accordionSidebar", function(e) {
    // alert('ds');
    if ($(window).width() >= 1200){
      $(this).removeClass("toggled") ; 
      // Add Header Class
      $(".header").css("left", "190px").css("right", "0px");
      $("#wrapper #content-wrapper").css("margin-left","190px");
    }
  });*/

  $(document).on('click',"#sidebarToggle", function(e) {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
    if ($(".sidebar").hasClass("toggled")) {
      // Small
      // Add Header Class
      $(".header").css("left", "50px").css("right", "0px");
      $("#wrapper #content-wrapper").css("margin-left","60px");
    } else {
      // Big
      // Add Header Class
      $(".header").css("left", "190px").css("right", "0px");
      $("#wrapper #content-wrapper").css("margin-left","190px");
    }    
  });


  $(document).on('click',"body,html", function(e) {
    if ($(window).width() <= 480){
      $('.sidebar').removeClass('mini-sidebar');
      $(".header").css("left", "0px").css("right", "0px");
      $("#wrapper #content-wrapper").css("margin-left","0");     
    }
  });

  $(document).on('click',".sidebar,#sidebarToggleTop,.fixed-right i.fa-times", function(e) {
    e.stopPropagation();
  });

})(jQuery); // End of use strict
