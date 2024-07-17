// NOTE: for now i've separated this out because I will probably end up making a custom select
// because it really does need search functionality and icons, but also then you lose os accessability so shrug

import "./Select.scss"

export default props => <select {...props}>{props.children}</select>
