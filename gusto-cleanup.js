// ==UserScript==
// @name         Gusto Cleanup
// @namespace    http://tampermonkey.net/
// @version      0.01
// @description  Cleaning up the Gusto
// @author       Antonio Hidalgo
// @match        *://*.gusto.com/*
// @require      https://code.jquery.com/jquery-3.3.1.js
// @updateURL    https://www.hidalgocare.com/uploads/7/9/7/8/79788936/gusto-cleanup.js
// @downloadURL  https://www.hidalgocare.com/uploads/7/9/7/8/79788936/gusto-cleanup.js
// ==/UserScript==

/* globals jQuery  */

(function() {

    /*eslint-disable */
    function log(msg) { /* console.log(msg); */ }
    /*eslint-enable */

    (function guardForPtoRequests() {

        function evaluatePtoFormPopup() {
            function decorateVerbiage() {
                let description_parent = jQuery("p.layout-main-simple-paragraph.margin-bottom-20px").parent();
                let already_decorated = description_parent.find("p.rule_warning").length;
                if (!already_decorated) {
                    description_parent.append('<p class="rule_warning layout-main-simple-paragraph margin-bottom-20px"><span>To submit, your request\'s # of hours <span class="strong">must not exceed</span> your # of remaining, Available Hours.</span></p>');
                }
                return already_decorated;
            } // End of decorateVerbiage declaration

            let already_decorated = decorateVerbiage();
            if (already_decorated) {
                return;
            }
            let pto_request_form = jQuery("form.form-horizontal.top-label-form");
            if (pto_request_form.length) {
                log("Found pto request form");
            } else {
                log("Could not find pto request form");
            }
            let submit_button = pto_request_form.find("button.btn-primary");

            function formHasError() {
                return pto_request_form.find("div.error").length;
            }

            pto_request_form.on('DOMSubtreeModified', "fieldset.row", function() {
                setTimeout(() => {
                    log('Feedback changed!');
                    if (formHasError()) {
                        log("On CHANGE, form has error.");
                        submit_button.prop('disabled', true);
                    } else {
                        log("On CHANGE, form is error-free.");
                        submit_button.removeAttr("disabled");
                    }
                }, 250); // wait for all verbiage change to finish.
            });

            // Do we even need to stop a click on a disabled button?
            submit_button.click(function handleExcessiveRequest(event) {
                if (formHasError()) {
                    log("On click, form has error.");
                    event.preventDefault();
                } else {
                    // We are happy, proceed with form submit.
                    log("On click, form is error-free.");
                }
            });

        } // end of evaluatePtoFormPopup fun declaration

        function mightBeOnTimeOffMenuItem() {
            log("We got a nav click.");

            function wireTheButton() {
                let my_interval = setInterval(() => {
                    let the_button = jQuery("div.layout-main-simple.margin-top-15px button.btn-primary:visible");
                    if (the_button.length) {
                        the_button.click(function handleTimeOffClick() {
                            // wait for popup to render and then evaluate it.
                            setTimeout(evaluatePtoFormPopup, 50);
                            clearInterval(my_interval);
                        });
                    }
                }, 333);
            }

            var onPtoPage = jQuery("li.time-off-nav-item.current");
            if (onPtoPage) {
                log("on pto page.");
                // after nav click, wait for Request Time Off button to load
                wireTheButton();
            } // end of onPtoPage
        }

        function wireUpTheMenu() {
            mightBeOnTimeOffMenuItem();
            jQuery("div.nav-menu a.time-off span").click(mightBeOnTimeOffMenuItem);
        }

        // after page load, waiting for nav to load
        for (let idx = 2; idx < 5; idx = idx + 1) {
            setTimeout(wireUpTheMenu, 1000 * idx);
        }
    }());

}());
