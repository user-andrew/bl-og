/* $.getJSON(
  "https://adapools.org/cache/pools/bd1d1aafead6f652f76f5921b4ffdb429d7eb9d5322d0f4700f4f70f997c5a82.json",
  (data) => {
    // $.each( data, function( i, val ) { $( '#' + data.id + '_' + i ).text(val); });
    document.querySelector("#pool-adress").innerHTML = data.id;
    document.querySelector("#pool-tag").innerHTML = data.tag;
    document.querySelector("#pool-total-stake").innerHTML = data.total_stake;
    document.querySelector("#pool-reward-value").innerHTML = data.lifetime_stakers;
    document.querySelector("#pool-tax-fixed").innerHTML = data.tax_fixed;
    document.querySelector("#pool-last-epoch").innerHTML = data.share + " %";
    document.querySelector("#pool-roa").innerHTML = data.roa;
    document.querySelector("#pool-roi").innerHTML = data.roi;
  }
); */
//livestats.json - iz ovog ide live stake, i lifetime blocks, a izgleda ovak {"livestake": 8733730395034, "updatedAt": 1588084002, "epochblocks": 2, "lifetimeblocks": 11, "lastBlockEpoch": 136}

async function getLiveStats() {
  let response = await fetch(
    "https://pooltool.s3-us-west-2.amazonaws.com/8e4d2a3/pools/bd1d1aafead6f652f76f5921b4ffdb429d7eb9d5322d0f4700f4f70f997c5a82/livestats.json",
    {
      method: "GET",
      // headers: {
      //   'Content-Type': 'application/json;charset=utf-8',

      // },
    }
  );

  if (response.ok) {
    // if HTTP-status is 200-299
    // get the response body (the method explained below)
    let json = await response.json();
    let $liveStake = json.livestake; //in lovelace
    let $lifetimeBlocks = json.lifetimeblocks;
    $liveStake = ($liveStake / 1000000 / 1000000).toFixed(2); //in million ADA
    $("#pool-total-stake").html($liveStake + " M");
    $("#pool-total-blocks").html($lifetimeBlocks);
  } else {
    console.log("HTTP-Error: " + response.status);
  }
}

$.getJSON(
  "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=Ada&tsyms=BTC,USD,EUR&api_key=da5c2209128482ded3f5dabbe7260d828b351b7a62c6fc18a5f41fc8f336f12e",
  (data) => {
    $(".price-holder").html(
      `<a class="api-link" href="https://min-api.cryptocompare.com/" target="_blank">${data.RAW.ADA.USD.PRICE} USD</a>`
    );
  }
);
//livestats.json - iz ovog ide live stake, i lifetime blocks, a izgleda ovak {"livestake": 8733730395034, "updatedAt": 1588084002, "epochblocks": 2, "lifetimeblocks": 11, "lastBlockEpoch": 136}
// $.getJSON("https://pooltool.s3-us-west-2.amazonaws.com/8e4d2a3/pools/bd1d1aafead6f652f76f5921b4ffdb429d7eb9d5322d0f4700f4f70f997c5a82/livestats.json").done((data) => {
//   let $liveStake = data.livestake; //in lovelace
//   let $lifetimeBlocks = data.lifetimeblocks;
//   $liveStake = ($liveStake / 1000000 / 1000000).toFixed(2); //in million ADA
//   $("#pool-total-stake").html($liveStake + " M");
//   $("#pool-total-blocks").html($lifetimeBlocks);
// })

//epochstats.json  - iz ovog total rewards i performance history i ROI
let $history = "";
let $rewards = 0;
let $roi = 0;
let $epochCount = 0;
let $averageStakePerEpoch = 0;
$.getJSON(
  "https://pooltool.s3-us-west-2.amazonaws.com/8e4d2a3/pools/bd1d1aafead6f652f76f5921b4ffdb429d7eb9d5322d0f4700f4f70f997c5a82/epochstats.json"
).done(function (data) {
  $.each(data, function (i, item) {
    if (data[i].hasOwnProperty("epochSlots")) {
      //history
      if (data[i].epochSlots == null) {
        $history =
          "Epoch " +
          data[i].epoch +
          " - 0" +
          "/" +
          data[i].blocks +
          " blocks" +
          "<br />" +
          $history;
      } else {
        if (data[i].blocks != 0) {
          if (data[i].epochSlots == 0) {
            data[i].epochSlots = data[i].blocks;
          }
          $history =
            "Epoch " +
            data[i].epoch +
            " - " +
            data[i].blocks +
            "/" +
            data[i].epochSlots +
            " blocks " +
            (data[i].epochSlots === data[i].blocks ||
            data[i].blocks > data[i].epochSlots
              ? `<span>🌟</span>`
              : "") +
            "<br />" +
            $history;
        } else {
          $history =
            "Epoch " +
            data[i].epoch +
            " - " +
            data[i].blocks +
            "/" +
            data[i].epochSlots +
            " blocks" +
            "<br />" +
            $history;
        }
      }
      $rewards += data[i].value_for_stakers; //in lovelace
      $averageStakePerEpoch += data[i].blockstake; //in lovelace
      $epochCount++;
    }
  });

  //calculate roi
  $averageStakePerEpoch = $averageStakePerEpoch / $epochCount;
  $roi = $rewards / $averageStakePerEpoch;
  $roi = ((Math.pow($roi + 1, 1 / ($epochCount / 365)) - 1) * 100).toFixed(1);
  $("#pool-roi").html($roi + " %");

  //calculate rewards in k ADA
  $rewards = ($rewards / 1000000 / 1000).toFixed(1);
  $("#pool-reward-value").html($rewards + " k ADA");

  $("#history").html($history);
});

//script for scroll

$(document).ready(() => {
  $(".ada-button").click(() => {
    $(".ada-button").toggleClass("toggle-show-ada-button");
    $(".price-container").toggleClass("show-ada");
  });

  getLiveStats();

  setTimeout(() => {
    $(".spinner").css("transform", `rotate(90deg) scale(1)`);

    setTimeout(() => {
      $(".spinner").css("transform", `rotate(0deg) scale(1)`);

      setTimeout(() => {
        $(window).scroll(() => {
          var scrollPos = $(document).scrollTop();

          $(".static_logo").css("transform", `rotate(${scrollPos * 0.3}deg)`);
          // $(".static_logo").css("filter", `hue-rotate(${scrollPos*1}deg)`)

          // $(".logo_component").css("filter", `hue-rotate(${scrollPos*1}deg)`)
          // $(".logo_component").css("filter", `grayscale(${scrollPos*0.1})`)
        });
      }, 700);
    }, 900);
  }, 200);
});
