var ProductImg = document.getElementById("ProductImg");
var SmallImg = document.getElementsByClassName("small-img");

$(document).ready(function() {
    $(SmallImg[0]).click(function() {
        $(".container-fluid").css("background", "#000");
        $(".product-title").css("color", "#000");
        $(".price span:first-child").css("color", "#000");
        $(".custom-btn").css("background", "#000");
        $(".reviews i").css("color", "#000");
        $(".colors").css("background", "rgb(55, 55, 55)");
        ProductImg.src = SmallImg[0].src
    });
    $(SmallImg[1]).click(function() {
        $(".container-fluid").css("background", "rgb(186, 34, 42)");
        $(".product-title").css("color", "rgb(186, 34, 42)");
        $(".price span:first-child").css("color", "rgb(186, 34, 42)");
        $(".custom-btn").css("background", "rgb(186, 34, 42)");
        $(".reviews i").css("color", "rgb(186, 34, 42)");
        $(".colors").css("background", "rgb(186, 34, 42)");
        ProductImg.src = SmallImg[1].src
    });
    $(SmallImg[2]).click(function() {
        $(".container-fluid").css("background", "rgb(200, 200, 200)");
        $(".product-title").css("color", "rgb(200, 200, 200)");
        $(".price span:first-child").css("color", "rgb(200, 200, 200)");
        $(".custom-btn").css("background", "rgb(200, 200, 200)");
        $(".reviews i").css("color", "rgb(200, 200, 200)");
        $(".colors").css("background", "rgb(200, 200, 200)");
        ProductImg.src = SmallImg[2].src
    });
    $(SmallImg[3]).click(function() {
        $(".container-fluid").css("background", "rgb(232, 198, 35)");
        $(".product-title").css("color", "rgb(232, 198, 35)");
        $(".price span:first-child").css("color", "rgb(232, 198, 35)");
        $(".custom-btn").css("background", "rgb(232, 198, 35)");
        $(".reviews i").css("color", "rgb(232, 198, 35)");
        $(".colors").css("background", "rgb(232, 198, 35)");
        ProductImg.src = SmallImg[3].src
    });
    $('.product-inf a').click(function() {
    
        $('.product-inf li').removeClass('active');
        $(this).parent().addClass('active');
    
        let currentTab = $(this).attr('href');
        $('.tabs-content div').hide();
        $(currentTab).show();
    
        return false;
    });
    $('.black').click(function(){
        $(".container-fluid").css("background", "#000");
        $(".product-title").css("color", "#000");
        $(".price span:first-child").css("color", "#000");
        $(".custom-btn").css("background", "#000");
        $(".reviews i").css("color", "#000");
        $(".colors").css("background", "rgb(55, 55, 55)");
        ProductImg.src = SmallImg[0].src
    });
    $('.red').click(function(){
        $(".container-fluid").css("background", "rgb(186, 34, 42)");
        $(".product-title").css("color", "rgb(186, 34, 42)");
        $(".price span:first-child").css("color", "rgb(186, 34, 42)");
        $(".custom-btn").css("background", "rgb(186, 34, 42)");
        $(".reviews i").css("color", "rgb(186, 34, 42)");
        $(".colors").css("background", "rgb(186, 34, 42)");
        ProductImg.src = SmallImg[1].src
    });
    $('.white').click(function(){
        $(".container-fluid").css("background", "rgb(200, 200, 200)");
        $(".product-title").css("color", "rgb(200, 200, 200)");
        $(".price span:first-child").css("color", "rgb(200, 200, 200)");
        $(".custom-btn").css("background", "rgb(200, 200, 200)");
        $(".reviews i").css("color", "rgb(200, 200, 200)");
        $(".colors").css("background", "#c8c8c8");
        ProductImg.src = SmallImg[2].src
    });
    $('.yellow').click(function(){
        $(".container-fluid").css("background", "rgb(232, 198, 35)");
        $(".product-title").css("color", "rgb(232, 198, 35)");
        $(".price span:first-child").css("color", "rgb(232, 198, 35)");
        $(".custom-btn").css("background", "rgb(232, 198, 35)");
        $(".reviews i").css("color", "rgb(232, 198, 35)");
        $(".colors").css("background", "#e8c623");
        ProductImg.src = SmallImg[3].src
    });
});