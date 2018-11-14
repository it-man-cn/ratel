import React from "react";
import ReactDOM from "react-dom";
import screenfull from "screenfull";
import classnames from "classnames";

import FrameHeader from "./FrameLayout/FrameHeader";

export default class FrameLayout extends React.Component {
    state = {
        isFullscreen: false,
        editingQuery: false,
    };

    _frameRef = React.createRef();

    componentDidMount() {
        // Sync fullscreen exit in case exited by ESC.
        // IDEA: This is not efficient as there will be as many event listeners as
        // there are frames.
        document.addEventListener(
            screenfull.raw.fullscreenchange,
            this.syncFullscreenExit,
        );
    }

    componentWillUnmount() {
        document.removeEventListener(
            screenfull.raw.fullscreenchange,
            this.syncFullscreenExit,
        );
    }

    /**
     * sycnFullscreenExit checks if fullscreen, and updates the state to false if not.
     * used as a callback to fullscreen change event. Needed becasue a user might
     * exit fullscreen by pressing ESC.
     */
    syncFullscreenExit = () => {
        const isFullscreen = screenfull.isFullscreen;

        if (!isFullscreen) {
            this.setState({ isFullscreen: false });
        }
    };

    handleToggleFullscreen = () => {
        if (!screenfull.enabled) {
            return;
        }

        const { isFullscreen } = this.state;

        if (isFullscreen) {
            screenfull.exit();
            this.setState({ isFullscreen: false });
        } else {
            const frameEl = ReactDOM.findDOMNode(this._frameRef.current);
            screenfull.request(frameEl);

            // If fullscreen request was successful, set state.
            if (screenfull.isFullscreen) {
                this.setState({ isFullscreen: true });
            }
        }
    };

    handleToggleEditingQuery = () =>
        this.setState(
            {
                editingQuery: !this.state.editingQuery,
            },
            () => {
                if (this.state.editingQuery) {
                    this.queryEditor.focus();
                }
            },
        );

    render() {
        const {
            children,
            onDiscardFrame,
            onSelectQuery,
            frame,
            collapsed,
            responseFetched,
        } = this.props;
        const { editingQuery, isFullscreen } = this.state;

        return (
            <li
                className={classnames("frame-item", {
                    fullscreen: isFullscreen,
                    collapsed,
                    "frame-session": responseFetched,
                })}
                ref={this._frameRef}
            >
                <FrameHeader
                    frame={frame}
                    isFullscreen={isFullscreen}
                    collapsed={collapsed}
                    editingQuery={editingQuery}
                    onToggleFullscreen={this.handleToggleFullscreen}
                    onToggleEditingQuery={this.handleToggleEditingQuery}
                    onDiscardFrame={onDiscardFrame}
                    onSelectQuery={onSelectQuery}
                />
                {!collapsed ? children : null}
            </li>
        );
    }
}
