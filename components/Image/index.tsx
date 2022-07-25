import styled from '@emotion/styled'

type OuterExtensionProps = {
    width?: string
    height?: string
}
type Props = React.ImgHTMLAttributes<HTMLImageElement> & OuterExtensionProps
const Image: React.FC<Props> = (props) => {
    return (
        <Outer
            className={props.className}
            width={props.width}
            height={props.height}
        >
            <InnerImg {...props}></InnerImg>
        </Outer>
    )
}
export default Image

const Outer = styled.div<OuterExtensionProps>`
    display: block;
    ${(props) => (props.width ? `width: ${props.width}` : '')};
    ${(props) => (props.height ? `height: ${props.height}` : '')};
`

const InnerImg = styled.img`
    width: 100%;
    height: 100%;
`
