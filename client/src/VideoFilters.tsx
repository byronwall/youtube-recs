import * as React from "react";
import { Row, Col, Form, FormControl, Button } from "react-bootstrap";

export interface FilterState {
  maxLength: number;
  minRatio: number;
}
interface FilterProps {
  onUpdate: (filters: FilterState) => void;
}

export class VideoFilters extends React.Component<FilterProps, FilterState> {
  constructor(props: FilterProps) {
    super(props);

    this.state = {
      maxLength: 20,
      minRatio: 5
    };
  }

  handleLength(event: any) {
    this.setState({
      maxLength: event.target.value
    });
  }

  handleRatio(event: any) {
    this.setState({
      minRatio: event.target.value
    });
  }

  handleFilter() {
    this.props.onUpdate(this.state);
  }

  render() {
    return (
      <Row>
        <Col md={12}>
          <Form inline={true}>
            <FormControl
              type="text"
              placeholder="max length"
              value={this.state.maxLength}
              onChange={event => this.handleLength(event)}
            />

            <FormControl
              type="text"
              placeholder="ratio"
              value={this.state.minRatio}
              onChange={event => this.handleRatio(event)}
            />

            <Button onClick={() => this.handleFilter()}>Filter</Button>
          </Form>
        </Col>
      </Row>
    );
  }
}
