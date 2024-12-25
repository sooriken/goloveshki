import module from './modules/module.js';

import AirDatepicker from 'air-datepicker';
import 'air-datepicker/air-datepicker.css';

new AirDatepicker('#date');

console.log(module);

var faqItems = document.getElementsByClassName("faq__item");
console.log(faqItems);

faqItems[2].onclick = function() {
  changeFaq(2);
};

faqItems[1].onclick = function() {
  changeFaq(1);
};

faqItems[0].onclick = function() {
  changeFaq(0);
};

function changeFaq(faqID) {
    console.log(faqItems[faqID]);
    console.log(faqID);
    var i = 0;
    while(i < faqItems.length) {
        faqItems[i].classList.remove("faq__item--active");
        console.log(i);
        i++;
    }
    console.log("stop");
    faqItems[faqID].classList.add("faq__item--active");
}
