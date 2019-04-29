// contains general utilities important for multiple modules
// import styled from "styled-components"


class IneditableValueField extends React.Component {
    render() {
        const style = {backgroundColor: "#303030", fontFamily: "courier"}
        return( <span style={style}> {this.props.children} </span> )
    }
}


class ActionButton extends React.Component {
    constructor(props) {
        super(props);
        // props.colorClass set color class default is w3-black
        // props.onAction function to execute on click
        // props.label labeling
        // props.loading if true, button will be disabled and loading indicator is shown
        this.handleAction = this.handleAction.bind(this)
    }
    
    handleAction(event){
        this.props.onAction()
    }

    render() {
        const style = {marginTop: "2px", marginBottom: "2px"}
        return( 
            <button style={style}
                className={this.props.colorClass ? ("w3-button" + this.props.colorClass) : "w3-button w3-black"}
                onClick={this.handleAction}
                disabled={this.props.loading ? true : false}
                > 
                {this.props.loading ? (<LoadingIndicator message="" size="tiny" />) : null}
                {this.props.label} 
            </button> )
    }
}

class CollapsibleListItem extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.props.onChange(event.target.value)
    }

    render() {
        // Inputs:
        // props.value
        // props.name
        // props.itemContent contains content; "" for empty
        
        const headerStyle = {
            marginTop: "10px",
            marginBottom: "0px",
            paddingTop: "10px",
            paddingBottom: "10px",
            paddingLeft: "16px",
            paddingRight: "16px",
            color: "#fff",
            backgroundColor: "#303030"
        }
        const contentStyle = {
            marginTop: "0px",
            marginBottom: "0px",
            paddingTop: "10px",
            paddingBottom: "10px",
            paddingLeft: "16px",
            paddingRight: "16px",
            color: "#fff", 
            backgroundColor: "#575757"
        }
        console.log("peep" + this.props.itemContent)

        return (
            <div>
                <label>
                    <div key={this.props.value} style={headerStyle}>
                        <input 
                            type="radio" name="templ_select"
                            value={this.props.value}
                            onChange={this.handleChange}>
                        </input>
                        &nbsp; {this.props.name}
                    </div>
                </label>
                {this.props.itemContent != "" &&
                    <div style={contentStyle}>
                        {console.log(this.props.itemContent)}
                        {this.props.itemContent}
                    </div>
                }
            </div>
        );
    }
}

class CollapsibleList extends React.Component {
    render () {
        // Inputs:
        // props.itemValues contains values of list items
        // props.itemNames contains names of list items
        // props.itemContent contains content for the
        //  list item which has focus; maximally one item can have focus
        // props.whichFocus contains the value of the
        //  the list items that has focus; "" if none has focus
        // props.onChange function executed once the focus changes
        
        return (
            <div>
                {
                    this.props.itemValues.map( (itemValue, index) => (
                        <CollapsibleListItem 
                            key={itemValue}
                            value={itemValue}
                            name={this.props.itemNames[index]}
                            itemContent={this.props.whichFocus == itemValue ? this.props.itemContent : ''}
                            onChange={this.props.onChange}
                        />
                    ))
                }
            </div>
        );

    }
}


class LoadingIndicator extends React.Component {
    render() {
        let loaderClass
        if( this.props.size == 'large' ){
            loaderClass='large_loader';
        } else if( this.props.size == 'small' ){
            loaderClass='small_loader';
        } else{
            loaderClass='tiny_loader';
        }
        return (
            <div className="w3-container w3-center">
                    <div className={loaderClass}></div>
                    {this.props.message ? (
                        <div className="w3-center-align">{this.props.message}</div>
                        ):( null )
                    }
            </div>
        );
    }
}


class Title extends React.Component {
    render() {
        return ( <h1> {this.props.children} </h1> )
    }
}


class Message extends React.Component {
    render() {
        const color = {
            error: "w3-red",
            warning: "w3-orange",
            info: "w3-blue",
            success: "w3-green"
        };
        return ( <div className={"w3-panel " + color[this.props.type]}> {this.props.children} </div> );
    }
}


class DisplayServerMessages extends React.Component {
    render() {
        if( this.props.messages.length > 0) {
            return (
            <div>
                {
                    this.props.messages.map( (message, index) => (
                        <div key={index}>
                            <Message type={message.type}>{message.text}</Message>
                        </div>
                    ))
                }
            </div>
            );
        }
        else {
            return null;
        }
    }
}


function sleep(secs) {
    secs = (+new Date) + secs * 1000;
    while ((+new Date) < secs);
}


class AjaxComponent extends React.Component {
    // diplays content based on server information
    constructor(props) {
        super(props);
        // Inputs:
        // props.requestRoute route to perform the post request on
        // props.buildContentOnSuccess function which builds content on successful request
        //  function receives a single argument (data)
        // props.loaderSize size of loading indicator (large, small, tiny)
        // props.loaderMessage message displayed on loading indicator

        this.state = {
            loading: true,
            error: false
        };  

        this.data = []; // container for requested server info
        this.serverMessages = [];    // container for errors/warnings/infos 
                                    //from server upon ajax request
                                    
        this.request = this.request.bind(this);
    }

    request(){ // ajax request to server
        fetch(this.props.requestRoute, {
            method: "POST",
            body: JSON.stringify(this.props.sendData),
            headers: new Headers({
                'Content-Type': 'application/json'
              }),
              cache: "no-cache"
        }).then(res => res.json())
        .then(
            (result) => {
                this.serverMessages = result.messages;
                let errorOccured = false;
                for( let i=0;  i<this.serverMessages.length; i++){
                    if(this.serverMessages[i].type == "error"){
                        errorOccured = true;
                        break;
                    }
                }
                if (errorOccured){
                    this.setState({loading: false, error: true})
                } 
                else {
                    this.data = result.data;
                    this.setState({loading: false, error: false});
                }
            },
            (error) => {
                // server could not be reached
                this.serverMessages = [{type: "error", text: serverNotReachableError}];
                this.setState({loading: false, error: true});
            }
        )
    }

    componentDidMount() {
        if(this.state.loading) {
            this.request();
        }
    }

    render() {
        if (this.state.loading) {
            return(
                <LoadingIndicator message={this.props.loaderMessage} size={this.props.loaderSize} />
            )
        } else if (this.state.error) {
            return (
                <DisplayServerMessages messages={this.serverMessages} />
            )
        } else{
            return (
                <div>
                    <DisplayServerMessages messages={this.serverMessages} />
                    {this.props.buildContentOnSuccess(this.data)}
                </div>
            )
        }
    }
}


class FileUploadComponent extends React.Component {
    // diplays content based on server information
    constructor(props) {
        super(props);
        // Inputs:
        // props.requestRoute the route to send the post request to
        // props.instruction short instructive statement

        this.state = {
            status: "wait_for_upload", // can be "wait_for_upload"/"uploading"/"done"
            error: false
        };  

        this.serverMessages = [];    // container for errors/warnings/infos 
                                    //from server upon ajax request
                                    
        this.file = "" // container to store file object
        
        this.upload = this.upload.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
    }

    handleFileChange(event){
        this.file = event.target.files[0]
    }

    upload(event){ // ajax request to server
        const fileToUpload = this.file
        if (this.fileToUpload == ""){
            this.serverMessages = [{type:"error", text:"No file selected."}]
            this.setState({status: "wait_for_upload", error: true})
        }
        else{
            this.setState({status:"uploading"})
            let formData = new FormData()
            formData.append("file", fileToUpload)
            fetch(this.props.requestRoute, {
                method: "POST",
                body: formData,
                cache: "no-cache"
            }).then(res => res.json())
            .then(
                (result) => {
                    this.serverMessages = result.messages;
                    let errorOccured = false;
                    for( let i=0;  i<this.serverMessages.length; i++){
                        if(this.serverMessages[i].type == "error"){
                            errorOccured = true;
                            break;
                        }
                    }
                    if (errorOccured){
                        this.setState({status: "wait_for_upload", error: true})
                    } 
                    else {
                        this.setState({status: "done", error: false});
                    }
                },
                (error) => {
                    // server could not be reached
                    this.serverMessages = [{type: "error", text: serverNotReachableError}];
                    this.setState({status: "wait_for_upload", error: true});
                }
            )
        }

        
    }

    render() {
        status = this.state.status
        return (
            <div>
                <DisplayServerMessages messages={this.serverMessages} />
                <p>
                {this.props.instruction}<br/>
                <input 
                    className="w3-button w3-border w3-border-grey"
                    type="file" 
                    name="file" 
                    onChange={this.handleFileChange}/>
                </p>
                <ActionButton label="import" loading={status == "uploading"} onAction={this.upload}/>
            </div>
        );

    }
}