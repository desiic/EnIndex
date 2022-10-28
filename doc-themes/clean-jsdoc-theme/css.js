var fs = require('jsdoc/fs');
var path = require('jsdoc/path');


var defaultCSSProps = {
    // Font applied to headings.
    headingFont: 'heading',
    // Font applied to body/normal texts.
    bodyFont: 'body',
    // Font applied to code.
    codeFont: 'code',
    // The background color of selected text on the dark theme.
    darkSelectionBg: '#ffce76',
    // The text color of selected text on the dark theme.
    darkSelectionTextColor: '#222',
    // The background color of the body on the dark theme.
    darkBodyBg: '#1a1a1a',
    // The text color on the dark theme.
    darkBodyTextColor: '#fff',
    // Anchor's color on the dark theme.
    darkAnchorColor: '#00bbff',
    // Horizontal line color on the dark theme.
    darkHrColor: '#222',
    // Heading color on the dark theme.
    darkHeadingColor: '#fff',
    // Sidebar background color on the dark theme.
    darkSidebarBg: '#222',
    // Sidebar text color on the dark theme.
    darkSidebarTextColor: '#999',
    // Sidebar title's color on the dark theme.
    darkSidebarTitleColor: '#999',
    // Sidebar accordion title color on the dark theme.
    darkSidebarAccordionTitleColor: '#999',
    // Sidebar accordion title hover background color on the dark theme.
    darkSidebarAccordionTitleHoverBg: '#252525',
    // Sidebar accordion arrow color on the dark theme.
    darkSidebarAccordionArrowColor: '#999',
    // Sidebar accordion child background on the dark theme.
    darkSidebarAccordionChildBg: '#292929',
    // Sidebar accordion child item color on the dark theme.
    darkSidebarAccordionChildItemColor: '#fff',
    // Sidebar accordion child item hover background on the dark theme.
    darkSidebarAccordionChildItemHoverBg: '#2c2c2c',
    // Navbar background on the dark theme. Make sure it matches with the
    // background color of the body, otherwise it will look a bit odd.
    darkNavbarBg: '#1a1a1a',
    // Icon button color on the dark theme.
    darkIconButtonFillColor: '#999',
    // Navbar item text color on the dark theme.
    darkNavbarItemColor: '#999',
    // Color of the icon on the tooltip for font size on the dark theme.
    darkFontSizeTooltipIconColor: '#fff',
    // Disabled color of the icon on the tooltip for font size on the dark theme.
    darkFontSizeTooltipIconColorWhenDisabled: '#999',
    // Icon button background when hovered on the dark theme.
    darkIconButtonHoverBg: '#333',
    // Icon button background when click is active on the dark theme.
    darkIconButtonActiveBg: '#444',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',
    // Sidebar on the dark theme.
    darkSidebarColor: '#222',

}

/**
 * 
 * @param {typeof defaultCSSProps} cssProps 
 * @returns {string} :root css rule.
 */
function mapCSSPropsToCSSVar(cssProps) {
    return ""
}

module.exports = function (outdir) {
    fs.writeFileSync(path.join(outdir, 'new.css'), ":root{ --test-color: #007bff; }")

}